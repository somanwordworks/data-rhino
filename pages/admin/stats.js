import { getSession } from "next-auth/react";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  // ✅ Restrict access: only admin email
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const client = await pool.connect();

    // Users with total downloads + last login
    const result = await client.query(`
      SELECT 
        u.email,
        u.provider,
        COUNT(CASE WHEN ua.action = 'download' THEN 1 END) AS total_downloads,
        MAX(CASE WHEN ua.action = 'login' THEN ua.timestamp END) AS last_login
      FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id
      GROUP BY u.id
      ORDER BY total_downloads DESC;
    `);

    client.release();
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("DB Error in admin stats:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
