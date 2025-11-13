// pages/api/prompts.js
import Airtable from "airtable";
import { getPromptsData } from "../../lib/airtable";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const prompts = await getPromptsData();
            return res.status(200).json(prompts);
        } catch (err) {
            console.error("Error fetching prompts:", err);
            return res.status(500).json({ error: "Failed to fetch prompts" });
        }
    }

    if (req.method === "POST") {
        const { promptId } = req.body;

        if (!promptId) {
            return res.status(400).json({ error: "Missing promptId" });
        }

        try {
            const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
                process.env.AIRTABLE_BASE_ID
            );

            const record = await base(process.env.AIRTABLE_PROMPTS_TABLE).find(promptId);
            const currentCount = record.fields["usagecount"] || 0;

            await base(process.env.AIRTABLE_PROMPTS_TABLE).update(promptId, {
                usagecount: currentCount + 1,
            });

            return res.status(200).json({ success: true, newCount: currentCount + 1 });
        } catch (err) {
            console.error("Error updating usage:", err);
            return res.status(500).json({ error: "Failed to update usage" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
