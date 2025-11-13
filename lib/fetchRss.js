import Parser from "rss-parser";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const parser = new Parser({
    customFields: {
        item: [
            ["media:content", "mediaContent"],
            ["media:thumbnail", "mediaThumbnail"],
            ["content:encoded", "encodedContent"],
            ["summary", "summary"], // Atom feeds
        ],
    },
});

// ✅ Extract og:image
async function getOgImage(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let ogImage =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[property="og:image:secure_url"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
            $('meta[name="twitter:image:src"]').attr("content") ||
            null;

        if (ogImage && ogImage.startsWith("/")) {
            const baseUrl = new URL(url).origin;
            ogImage = baseUrl + ogImage;
        }

        return ogImage;
    } catch (err) {
        console.error("OG image fetch failed:", url, err.message);
        return null;
    }
}

// ✅ Apache scrapers (6 months, 6 posts max)
async function scrapeApachePage(url, projectName) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        const items = [];
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 6); // ✅ last 6 months for Apache

        const addItem = (title, link, dateStr) => {
            if (!dateStr) return;
            const parsed = new Date(dateStr);
            if (isNaN(parsed)) return;
            if (parsed < cutoffDate) return; // ✅ skip old
            items.push({
                title,
                link,
                pubDate: parsed.toISOString().split("T")[0],
            });
        };

        if (projectName === "Spark") {
            $("ul li a").each((i, el) => {
                if (i >= 6) return false;
                const link = "https://spark.apache.org" + $(el).attr("href");
                const title = $(el).text().trim();
                const dateMatch = $(el).parent().text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
                addItem(title, link, dateMatch);
            });
        }

        if (projectName === "Kafka") {
            $(".post h2").each((i, el) => {
                if (i >= 6) return false;
                const anchor = $(el).find("a");
                const link = "https://kafka.apache.org" + anchor.attr("href");
                const title = anchor.text().trim();
                const dateMatch = $(el).text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
                addItem(title, link, dateMatch);
            });
        }

        if (projectName === "Flink") {
            $(".blog-post-title").each((i, el) => {
                if (i >= 6) return false;
                const anchor = $(el).find("a");
                const link = anchor.attr("href");
                const title = anchor.text().trim();
                const dateMatch = $(el).siblings(".blog-post-meta").text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
                addItem(title, link, dateMatch);
            });
        }

        if (projectName === "Airflow") {
            $(".post-title").each((i, el) => {
                if (i >= 6) return false;
                const anchor = $(el).find("a");
                const link = anchor.attr("href");
                const title = anchor.text().trim();
                const dateMatch = $(el).text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
                addItem(title, link, dateMatch);
            });
        }

        if (projectName === "Iceberg") {
            $(".blog-post-title").each((i, el) => {
                if (i >= 6) return false;
                const anchor = $(el).find("a");
                const link = "https://iceberg.apache.org" + anchor.attr("href");
                const title = anchor.text().trim();
                const dateMatch = $(el).text().match(/\d{4}-\d{2}-\d{2}/)?.[0];
                addItem(title, link, dateMatch);
            });
        }

        return await Promise.all(
            items.map(async (item) => {
                const image = await getOgImage(item.link);
                return {
                    ...item,
                    snippet: "",
                    image: image || "/logos/news-placeholder.png",
                    project: projectName,
                };
            })
        );
    } catch (err) {
        console.error(`Apache scrape failed (${projectName}):`, err.message);
        return [];
    }
}

// ✅ Main RSS fetcher
export async function fetchRssFeed(url, projectName = null) {
    try {
        // Apache projects (except Beam) → scraper
        if (projectName && ["Spark", "Kafka", "Flink", "Airflow", "Iceberg"].includes(projectName)) {
            return await scrapeApachePage(url, projectName);
        }

        // Beam + normal RSS feeds
        const feed = await parser.parseURL(url);

        const cutoffDate = new Date();
        if (projectName === "Beam") {
            cutoffDate.setMonth(cutoffDate.getMonth() - 1); // ✅ Beam = 1 month
        } else {
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // others = 12 months
        }

        const items = await Promise.all(
            feed.items.map(async (item) => {
                const pubDateRaw = item.pubDate || item.isoDate || item.updated || "";
                let pubDate = "";
                if (pubDateRaw) {
                    const parsed = new Date(pubDateRaw);
                    if (!isNaN(parsed)) pubDate = parsed.toISOString().split("T")[0];
                    if (parsed < cutoffDate) return null;
                }

                let image =
                    item.enclosure?.url ||
                    item.mediaContent?.url ||
                    item.mediaThumbnail?.url ||
                    (item.encodedContent &&
                        item.encodedContent.match(/<img[^>]+(?:src|data-src)="([^">]+)"/)?.[1]) ||
                    (item.content &&
                        item.content.match(/<img[^>]+(?:src|data-src)="([^">]+)"/)?.[1]) ||
                    null;

                if (!image && item.link) {
                    image = await getOgImage(item.link);
                }

                const snippet =
                    item.contentSnippet ||
                    item.summary ||
                    (item.encodedContent
                        ? item.encodedContent.replace(/<[^>]+>/g, "").substring(0, 160) + "..."
                        : "");

                return {
                    title: item.title || "",
                    link: item.link || "#",
                    pubDate,
                    snippet,
                    image: image || "/logos/news-placeholder.png",
                    project: projectName || null,
                };
            })
        );

        return items.filter(Boolean);
    } catch (err) {
        console.error("RSS fetch error:", url, err.message);
        return [];
    }
}

// ✅ Meetup.com RSS fetcher
export async function fetchMeetupEvents(groupUrl = "https://www.meetup.com/gittogether-hyderabad/events/rss/") {
    try {
        const feed = await parser.parseURL(groupUrl);

        return feed.items.map((item) => ({
            id: item.guid,
            title: item.title,
            link: item.link,
            date: new Date(item.pubDate).toLocaleDateString(),
            time: new Date(item.pubDate).toLocaleTimeString(),
            description: item.contentSnippet || "",
        }));
    } catch (error) {
        console.error("Meetup RSS fetch error:", error.message);
        return [];
    }
}
