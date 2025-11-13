import fetch from "node-fetch";
import * as cheerio from "cheerio";

// 🔹 Databricks Webinars
async function fetchDatabricksWebinars() {
    const url = "https://www.databricks.com/p/webinars";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const webinars = [];
    $(".card").each((_, el) => {
        const title = $(el).find(".card-title").text().trim();
        const date = $(el).find(".card-date").text().trim();
        const link = "https://www.databricks.com" + ($(el).find("a").attr("href") || "");
        const thumbnail = $(el).find("img").attr("src");

        if (title && link) {
            webinars.push({
                id: `db-${webinars.length}`,
                provider: "Databricks",
                title,
                date,
                link,
                thumbnail,
            });
        }
    });
    return webinars;
}

// 🔹 Microsoft Webinars
async function fetchMicrosoftWebinars() {
    const url = "https://events.microsoft.com/";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const webinars = [];
    $(".event-card").each((_, el) => {
        const title = $(el).find(".event-card-title").text().trim();
        const date = $(el).find(".event-card-date").text().trim();
        const link = $(el).find("a").attr("href");
        const thumbnail = $(el).find("img").attr("src");

        if (title && link) {
            webinars.push({
                id: `ms-${webinars.length}`,
                provider: "Microsoft",
                title,
                date,
                link,
                thumbnail,
            });
        }
    });
    return webinars;
}

// 🔹 AWS Webinars
async function fetchAWSWebinars() {
    const url = "https://aws.amazon.com/events/webinars/";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const webinars = [];
    $(".m-event-card").each((_, el) => {
        const title = $(el).find(".m-event-card-title").text().trim();
        const date = $(el).find(".m-event-card-date").text().trim();
        const link = "https://aws.amazon.com" + ($(el).find("a").attr("href") || "");
        const thumbnail = $(el).find("img").attr("src");

        if (title && link) {
            webinars.push({
                id: `aws-${webinars.length}`,
                provider: "AWS",
                title,
                date,
                link,
                thumbnail,
            });
        }
    });
    return webinars;
}

// 🔹 GCP Webinars
async function fetchGCPWebinars() {
    const url = "https://cloudonair.withgoogle.com/events";
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const webinars = [];
    $(".event-card").each((_, el) => {
        const title = $(el).find(".event-title").text().trim();
        const date = $(el).find(".event-date").text().trim();
        const link = $(el).find("a").attr("href");
        const thumbnail = $(el).find("img").attr("src");

        if (title && link) {
            webinars.push({
                id: `gcp-${webinars.length}`,
                provider: "GCP",
                title,
                date,
                link: link.startsWith("http") ? link : `https://cloudonair.withgoogle.com${link}`,
                thumbnail,
            });
        }
    });
    return webinars;
}

// 🔹 Apache Webinars (generic fallback, may need project-specific pages)
async function fetchApacheWebinars() {
    const url = "https://events.apache.org/"; // Apache community events
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const webinars = [];
    $("article").each((_, el) => {
        const title = $(el).find("h3").text().trim();
        const date = $(el).find("time").text().trim();
        const link = $(el).find("a").attr("href");
        const thumbnail = $(el).find("img").attr("src");

        if (title && link && date) {
            webinars.push({
                id: `apache-${webinars.length}`,
                provider: "Apache",
                title,
                date,
                link: link.startsWith("http") ? link : `https://events.apache.org${link}`,
                thumbnail,
            });
        }
    });
    return webinars;
}

// 🔹 Utility: parse date
function parseDateString(dateStr) {
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? null : new Date(parsed);
}

// 🔹 Unified fetcher
export async function fetchWebinars() {
    const [databricks, microsoft, aws, gcp, apache] = await Promise.all([
        fetchDatabricksWebinars(),
        fetchMicrosoftWebinars(),
        fetchAWSWebinars(),
        fetchGCPWebinars(),
        fetchApacheWebinars(),
    ]);

    const all = [...databricks, ...microsoft, ...aws, ...gcp, ...apache].map((w) => {
        const eventDate = parseDateString(w.date);
        return { ...w, eventDate };
    });

    // ✅ Keep only upcoming
    const upcoming = all.filter((w) => w.eventDate && w.eventDate >= new Date());

    // ✅ Sort by nearest date first
    upcoming.sort((a, b) => a.eventDate - b.eventDate);

    return upcoming;
}
