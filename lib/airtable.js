// lib/airtable.js
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
);

// ✅ NEW: expose a tiny helper so API routes can do table("name")
export const table = (name) => base(name);

// ✅ Utility: check table name is set
function validateTable(tableEnvVar, envName) {
    if (!tableEnvVar) {
        throw new Error(
            `❌ Airtable error: Missing env variable ${envName}. Please add it in .env.local`
        );
    }
    return tableEnvVar;
}

/* -----------------------------
 * Cloud / Content fetchers
 * ----------------------------- */

// ✅ Cloud Stats fetcher
export async function getAirtableData() {
    try {
        const t = validateTable(process.env.AIRTABLE_CLOUD_TABLE, "AIRTABLE_CLOUD_TABLE");
        const records = await base(t).select({}).all();

        return records.map((rec) => ({
            id: rec.id,
            Title: rec.fields.Title || "Untitled",
            Year: rec.fields.Year || "",
            Source: rec.fields.Source || "",
            Provider: rec.fields.Provider || "",
            MarketShare: rec.fields.MarketShare || "",
            Revenue: rec.fields.Revenue || "",
            DataCenters: rec.fields.DataCenters || "",
            ReportedDate: rec.fields.ReportedDate || "",
        }));
    } catch (err) {
        console.error("Airtable Cloud fetch error:", err.message);
        return [];
    }
}

// ✅ Ads fetcher
export async function getAdsData() {
    try {
        const t = validateTable(process.env.AIRTABLE_ADS_TABLE, "AIRTABLE_ADS_TABLE");
        const records = await base(t).select({}).all();

        return records.map((rec) => {
            const attachment = rec.fields.image ? rec.fields.image[0] : null;
            return {
                id: rec.id,
                title: rec.fields.title || "Untitled",
                link: rec.fields.link || "",
                image: attachment ? attachment.url : "",
                fileType: attachment ? attachment.type : "",
            };
        });
    } catch (err) {
        console.error("Airtable Ads fetch error:", err.message);
        return [];
    }
}

// ✅ Downloads fetcher
export async function getDownloadsData() {
    try {
        const t =
            process.env.AIRTABLE_DOWNLOADS_TABLE ||
            process.env.AIRTABLE_TABLE_NAME; // 👈 fallback

        if (!t) {
            throw new Error(
                "❌ Airtable error: Missing both AIRTABLE_DOWNLOADS_TABLE and AIRTABLE_TABLE_NAME in .env.local"
            );
        }

        const records = await base(t).select({}).all();

        return records.map((rec) => {
            const fileAttachment = rec.fields.File ? rec.fields.File[0] : null;
            const imageAttachment = rec.fields.Image ? rec.fields.Image[0] : null;

            return {
                id: rec.id,
                title: rec.fields.Title || "Untitled",
                category: rec.fields.Category || "",
                description: rec.fields.Description || "",
                file: fileAttachment ? fileAttachment.url : "",
                fileType: fileAttachment ? fileAttachment.type : "",
                image: imageAttachment ? imageAttachment.url : "",
                downloadCount: rec.fields["Download Count"] || 0,
                createdAt: rec.fields["Created At"] || "",
            };
        });
    } catch (err) {
        if (err.message.includes("Table name")) {
            console.error(
                `❌ Airtable Downloads fetch error: Check your .env. Did you mean "downloads" or "dowloads"?`
            );
        } else {
            console.error("Airtable Downloads fetch error:", err.message);
        }
        return [];
    }
}

// ✅ Prompts fetcher
export async function getPromptsData() {
    try {
        const t = validateTable(process.env.AIRTABLE_PROMPTS_TABLE, "AIRTABLE_PROMPTS_TABLE");
        const records = await base(t).select({}).all();

        return records.map((rec) => {
            const imageAttachment = rec.fields.image ? rec.fields.image[0] : null;

            return {
                id: rec.id,
                title: rec.fields.title || "Untitled",
                category: rec.fields.category || "",
                prompt: rec.fields.prompt || "",
                tags: rec.fields.tags || [],
                worksIn: rec.fields.worksIn || "",
                image: imageAttachment ? imageAttachment.url : "",
                usageCount: rec.fields.usagecount || 0,
                guide: rec.fields.guide || "",
            };
        });
    } catch (err) {
        console.error("Airtable Prompts fetch error:", err.message);
        return [];
    }
}

// ✅ Courses fetcher
export async function getCoursesData() {
    try {
        const t = validateTable(process.env.AIRTABLE_COURSES_TABLE, "AIRTABLE_COURSES_TABLE");
        const records = await base(t).select({}).all();

        return records.map((rec) => {
            const imageAttachment = rec.fields.image ? rec.fields.image[0] : null;
            const curriculumAttachment = rec.fields.curriculum ? rec.fields.curriculum[0] : null;

            return {
                id: rec.id,
                title: rec.fields.title || "Untitled",
                faculty: rec.fields.faculty || "",
                description: rec.fields.description || "",
                category: rec.fields.category || "",
                price: rec.fields.price || "",
                image: imageAttachment ? imageAttachment.url : "",
                curriculum: curriculumAttachment ? curriculumAttachment.url : "",
                likes: rec.fields.likes || 0,
            };
        });
    } catch (err) {
        console.error("Airtable Courses fetch error:", err.message);
        return [];
    }
}

// ✅ Update Likes (helper)
export async function updateCourseLike(id) {
    try {
        const t = validateTable(process.env.AIRTABLE_COURSES_TABLE, "AIRTABLE_COURSES_TABLE");
        const record = await base(t).find(id);
        const currentLikes = record.fields.likes || 0;

        const updated = await base(t).update(id, {
            likes: currentLikes + 1,
        });
        return updated;
    } catch (err) {
        console.error("Airtable updateCourseLike error:", err.message);
        throw err;
    }
}

// ✅ Queries fetcher
export async function getQueriesData() {
    try {
        const t = validateTable(process.env.AIRTABLE_QUERIES_TABLE, "AIRTABLE_QUERIES_TABLE");
        const records = await base(t).select({}).all();

        return records.map((rec) => ({
            id: rec.id,
            course: rec.fields.course || "",
            user: rec.fields.user || "",
            question: rec.fields.question || "",
            createdAt: rec.fields.createdAt || "",
        }));
    } catch (err) {
        console.error("Airtable Queries fetch error:", err.message);
        return [];
    }
}

// ✅ Queries saver
export async function saveQuery({ name, email, mobile, city, course, source, sourcenote }) {
    try {
        const t = validateTable(process.env.AIRTABLE_QUERIES_TABLE, "AIRTABLE_QUERIES_TABLE");
        const record = await base(t).create([
            {
                fields: {
                    name,
                    email,
                    mobile,
                    city,
                    course,
                    source,
                    sourcenote,
                },
            },
        ]);
        return record;
    } catch (err) {
        console.error("❌ Airtable saveQuery error:", err.message);
        throw err;
    }
}

/* -----------------------------
 * Requests / Replies
 * ----------------------------- */

// ✅ Requests list
export async function getRequestsData() {
    try {
        const t = validateTable(process.env.AIRTABLE_REQUESTS_TABLE, "AIRTABLE_REQUESTS_TABLE");
        const records = await base(t)
            .select({ sort: [{ field: "created_at", direction: "desc" }] })
            .all();

        return records.map((rec) => ({
            id: rec.id,
            text: rec.fields.text || "",
            user: rec.fields.user || "Anonymous",
            created_at: rec.fields.created_at || "",
        }));
    } catch (err) {
        console.error("Airtable Requests fetch error:", err.message);
        return [];
    }
}

// ✅ Replies for a request
export async function getRepliesData(requestId) {
    try {
        const t = validateTable(process.env.AIRTABLE_REPLIES_TABLE, "AIRTABLE_REPLIES_TABLE");
        const records = await base(t)
            .select({ filterByFormula: `{request_id} = '${requestId}'` })
            .all();

        return records.map((rec) => ({
            id: rec.id,
            text: rec.fields.text || "",
            user: rec.fields.user || "Member",
            created_at: rec.fields.created_at || "",
        }));
    } catch (err) {
        console.error("Airtable Replies fetch error:", err.message);
        return [];
    }
}

// (Optional) Save a new request — not used by your API right now,
// but handy if you want to move creation logic out of the route.
export async function saveRequest({ text, user }) {
    const t = validateTable(process.env.AIRTABLE_REQUESTS_TABLE, "AIRTABLE_REQUESTS_TABLE");
    const created = await base(t).create({
        text,
        user: user || "Anonymous",
        created_at: new Date().toISOString(),
    });
    return {
        id: created.id,
        text: created.get("text"),
        user: created.get("user"),
        created_at: created.get("created_at"),
        replies: [],
    };
}

// (Optional) Save a reply under a request
export async function saveReply({ requestId, text, user }) {
    const t = validateTable(process.env.AIRTABLE_REPLIES_TABLE, "AIRTABLE_REPLIES_TABLE");
    const created = await base(t).create({
        request_id: requestId,
        text,
        user: user || "Member",
        created_at: new Date().toISOString(),
    });
    return {
        id: created.id,
        text: created.get("text"),
        user: created.get("user"),
        created_at: created.get("created_at"),
    };
}
