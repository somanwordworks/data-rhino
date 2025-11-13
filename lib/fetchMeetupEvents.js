import Parser from "rss-parser";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const parser = new Parser();

// ✅ Helper to fetch OG image
async function getOgImage(url) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        let ogImage =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[property="og:image:secure_url"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content") ||
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

export async function fetchMeetupEvents(groupUrls = [
    "https://www.meetup.com/gittogether-hyderabad/events/rss/",
    "https://www.meetup.com/gittogether-bangalore/events/rss/",
    "https://www.meetup.com/gittogether-chennai/events/rss/",
]) {
    try {
        const results = await Promise.allSettled(
            groupUrls.map(async (url) => {
                const feed = await parser.parseURL(url);
                const parts = new URL(url).pathname.split("/");
                const groupName = parts[1] || "Meetup";

                return Promise.all(
                    feed.items.map(async (item, i) => {
                        const eventDate = new Date(item.pubDate || item.isoDate || Date.now());

                        // ✅ Skip past events
                        if (eventDate < new Date()) {
                            return null;
                        }

                        const image = await getOgImage(item.link);
                        return {
                            id: item.guid || `${groupName}-${i}`,
                            title: item.title || "Untitled Meetup",
                            link: item.link,
                            date: eventDate.toLocaleDateString(),
                            time: eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            description: item.contentSnippet || item.summary || "No description available.",
                            group: groupName,
                            image: image || "/logos/meetup.png",  // 👈 fallback
                            eventDate, // keep actual Date object for sorting
                        };
                    })
                );
            })
        );

        // ✅ Collect, filter nulls, and flatten
        let allEvents = results.flatMap((r) =>
            r.status === "fulfilled" ? r.value : []
        ).filter(Boolean);

        // ✅ Sort by nearest date first
        allEvents.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        return allEvents;
    } catch (error) {
        console.error("Meetup RSS fetch error:", error.message);
        return [];
    }
}
