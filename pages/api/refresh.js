// pages/api/refresh.js
import Parser from "rss-parser";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
);

const CLOUD_TABLE = process.env.AIRTABLE_CLOUD_TABLE;
const parser = new Parser();

// RSS Sources: Synergy + Canalys
const sources = [
    "https://www.srgresearch.com/articles/rss",
    "https://canalys.com/newsroom/rss",
];

// Normalize provider names
function normalizeProvider(raw) {
    raw = raw.toLowerCase();
    if (raw.includes("aws") || raw.includes("amazon")) return "AWS";
    if (raw.includes("azure") || raw.includes("microsoft")) return "Azure";
    if (raw.includes("google") || raw.includes("gcp")) return "GCP";
    if (raw.includes("alibaba")) return "Alibaba";
    if (raw.includes("oracle")) return "Oracle";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default async function handler(req, res) {
    try {
        let newRecords = [];

        // 🔹 Fetch from each RSS feed
        for (const url of sources) {
            const feed = await parser.parseURL(url);

            feed.items.forEach((item) => {
                const text = `${item.title} ${item.contentSnippet}`;

                // Match examples: "AWS 32%", "Azure at 23.5 percent", "Google Cloud 10 %"
                const regex =
                    /(AWS|Amazon|Azure|Microsoft|Google|GCP|Alibaba|Oracle)[^\d]{0,15}(\d{1,3}(\.\d+)?)(\s?(%|percent|pct))/gi;

                let match;
                while ((match = regex.exec(text)) !== null) {
                    const provider = normalizeProvider(match[1]);
                    let percent = parseFloat(match[2]);

                    // Fix: if value is less than 5, likely ".31" → treat as 31
                    if (percent < 5) {
                        percent = percent * 100;
                    }

                    // Skip growth mentions
                    if (/growth/i.test(text)) continue;

                    if (!isNaN(percent) && percent > 0 && percent <= 100) {
                        newRecords.push({
                            fields: {
                                Year: new Date().getFullYear(),
                                Country: "Global",
                                Provider: provider,
                                MarketShare: percent,
                                Revenue: null,
                                DataCenters: null,
                                ReportedDate: new Date().toISOString().split("T")[0],
                            },
                        });
                    }
                }
            });
        }

        // 🔹 Avoid inserting duplicates (Provider + Year already exists)
        const existing = await base(CLOUD_TABLE)
            .select({ fields: ["Year", "Provider"] })
            .all();

        const existingKeys = new Set(
            existing.map((r) => `${r.fields.Provider}-${r.fields.Year}`)
        );

        const filtered = newRecords.filter(
            (r) => !existingKeys.has(`${r.fields.Provider}-${r.fields.Year}`)
        );

        if (filtered.length > 0) {
            await base(CLOUD_TABLE).create(filtered, { typecast: true });
        }

        res.status(200).json({
            success: true,
            added: filtered.length,
            skipped: newRecords.length - filtered.length,
        });
    } catch (err) {
        console.error("Refresh error:", err.message);
        res.status(500).json({ error: err.message });
    }
}
