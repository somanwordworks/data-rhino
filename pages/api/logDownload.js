import { getSession } from "next-auth/react";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Log new download
    const session = await getSession({ req });
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const { file } = req.body;

    try {
      const client = await pool.connect();

      await client.query(
        `INSERT INTO user_activity (user_id, action, download_file)
         SELECT id, 'download', $1
         FROM users
         WHERE email = $2`,
        [file.name, session.user.email]
      );

      client.release();
      return res.status(200).json({ message: "Download logged" });
    } catch (err) {
      console.error("DB Error in logDownload:", err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  if (req.method === "GET") {
    // Get download counts
    try {
      const result = await pool.query(
        `SELECT download_file, COUNT(*) AS total
         FROM user_activity
         WHERE action = 'download'
         GROUP BY download_file`
      );

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("DB Error in get counts:", err);
      return res.status(500).json({ error: "Database error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
