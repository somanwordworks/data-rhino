// pages/api/reviews/external.js
import axios from "axios";

// 🔧 Helper to normalize relative dates like "3 years ago" → actual Date
function normalizeDate(dateStr) {
    if (!dateStr) return null;

    const lower = dateStr.toLowerCase();
    const now = new Date();

    if (lower.includes("year")) {
        const n = parseInt(lower);
        if (!isNaN(n)) return new Date(now.getFullYear() - n, now.getMonth(), now.getDate());
    }

    if (lower.includes("month")) {
        const n = parseInt(lower);
        if (!isNaN(n)) return new Date(now.getFullYear(), now.getMonth() - n, now.getDate());
    }

    if (lower.includes("week")) {
        const n = parseInt(lower);
        if (!isNaN(n)) {
            const d = new Date();
            d.setDate(d.getDate() - n * 7);
            return d;
        }
    }

    if (lower.includes("day")) {
        const n = parseInt(lower);
        if (!isNaN(n)) {
            const d = new Date();
            d.setDate(d.getDate() - n);
            return d;
        }
    }

    // Try direct parsing
    return new Date(dateStr);
}

export default async function handler(req, res) {
    const { company, page = 1, pageSize = 5 } = req.query;

    if (!company) {
        return res.status(400).json({ error: "Company is required" });
    }

    try {
        // Step 1: Search for company/place
        const searchRes = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_maps",
                q: company,
                type: "search",
                api_key: process.env.SERPAPI_KEY,
            },
        });

        const results = searchRes.data.local_results || [];
        results.sort(
            (a, b) => (b.reviews ? b.reviews : 0) - (a.reviews ? a.reviews : 0)
        );

        const result =
            results.find((r) =>
                r.title?.toLowerCase().includes(company.toLowerCase())
            ) || results[0];

        const placeId = result?.data_id;
        if (!placeId) {
            return res.status(404).json({ error: "No place found" });
        }

        console.log("Picked place:", result.title, "data_id:", placeId);

        // Step 2: Fetch reviews
        const reviewsRes = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_maps_reviews",
                data_id: placeId,
                api_key: process.env.SERPAPI_KEY,
            },
        });

        const allReviews =
            reviewsRes.data.reviews?.map((r) => {
                const parsed = normalizeDate(r.date);
                return {
                    text: r.snippet,
                    rating: r.rating,
                    source: "Google Maps",
                    date: r.date,
                    parsedDate: parsed && !isNaN(parsed) ? parsed.toISOString().split("T")[0] : r.date,
                };
            }) || [];

        // 🚀 No filter applied — return ALL reviews
        const p = parseInt(page);
        const ps = parseInt(pageSize);
        const start = (p - 1) * ps;
        const paginated = allReviews.slice(start, start + ps);

        res.status(200).json({
            total: allReviews.length,
            page: p,
            pageSize: ps,
            reviews: paginated,
        });
    } catch (err) {
        console.error("SerpApi error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
}
