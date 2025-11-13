import { getDownloadsData } from "../../lib/airtable";
import { sql } from "@vercel/postgres";
import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const downloads = await getDownloadsData();
      return res.status(200).json(downloads);
    } catch (err) {
      console.error("Error fetching downloads:", err);
      return res.status(500).json({ error: "Failed to fetch downloads" });
    }
  }

  if (req.method === "POST") {
    const { fileId, userEmail } = req.body;

    if (!fileId || !userEmail) {
      return res.status(400).json({ error: "Missing fileId or userEmail" });
    }

    try {
      // 🔹 1. Increment Airtable Download Count
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
        process.env.AIRTABLE_BASE_ID
      );

      const record = await base(process.env.AIRTABLE_DOWNLOADS_TABLE).find(fileId);
      const currentCount = record.fields["Download Count"] || 0;

      await base(process.env.AIRTABLE_DOWNLOADS_TABLE).update(fileId, {
        "Download Count": currentCount + 1,
      });

      // 🔹 2. Log into Postgres (activity table)
      await sql`
        INSERT INTO activity (user_email, action, file_id, created_at)
        VALUES (${userEmail}, 'download', ${fileId}, NOW())
      `;

      return res.status(200).json({ success: true, newCount: currentCount + 1 });
    } catch (err) {
      console.error("Error logging download:", err);
      return res.status(500).json({ error: "Failed to log download" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
