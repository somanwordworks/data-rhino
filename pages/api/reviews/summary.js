// pages/api/reviews/summary.js
import axios from "axios";

export default async function handler(req, res) {
    const { company } = req.query;

    if (!company) {
        return res.status(400).json({ error: "Company is required" });
    }

    try {
        // Step 1: Search for the company/place
        const searchRes = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_maps",
                q: company,
                type: "search",
                api_key: process.env.SERPAPI_KEY,
            },
        });

        // Best match: look for title containing the company name
        const result = searchRes.data.local_results?.find(r =>
            r.title?.toLowerCase().includes(company.toLowerCase())
        ) || searchRes.data.local_results?.[0];

        const placeId = result?.data_id;
        if (!placeId) {
            return res.status(404).json({ error: "No place found" });
        }

        console.log("Picked place:", result.title, "data_id:", placeId);

        // Step 2: Fetch reviews for that place
        const reviewsRes = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_maps_reviews",
                data_id: placeId,
                api_key: process.env.SERPAPI_KEY,
            },
        });

        const reviews = reviewsRes.data.reviews || [];
        console.log("Fetched reviews:", reviews.length);

        // Group reviews by year and rating
        const buckets = {};
        reviews.forEach((r) => {
            if (!r.date) return;

            const parsedDate = new Date(r.date);
            if (isNaN(parsedDate)) {
                // Skip relative dates like "a week ago"
                return;
            }

            const year = parsedDate.getFullYear();
            if (!buckets[year]) {
                buckets[year] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
            }
            buckets[year][r.rating] += 1;
            buckets[year].total += 1;
        });

        // Convert counts to percentages
        const yearly = Object.entries(buckets).map(([year, data]) => ({
            year,
            oneStar: ((data[1] / data.total) * 100).toFixed(1),
            twoStar: ((data[2] / data.total) * 100).toFixed(1),
            threeStar: ((data[3] / data.total) * 100).toFixed(1),
            fourStar: ((data[4] / data.total) * 100).toFixed(1),
            fiveStar: ((data[5] / data.total) * 100).toFixed(1),
        }));

        res.status(200).json(yearly);
    } catch (err) {
        console.error("Summary API error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to generate summary" });
    }
}
