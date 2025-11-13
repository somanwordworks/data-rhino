import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default NextAuth({
  providers: [
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // Microsoft login (Azure AD)
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID || "common", // fallback for multi-tenant
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // Called when user logs in
    async signIn({ user, account }) {
      try {
        const client = await pool.connect();

        // Insert user if not exists
        await client.query(
          `INSERT INTO users (email, provider)
           VALUES ($1, $2)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, account.provider]
        );

        // Log login event
        await client.query(
          `INSERT INTO user_activity (user_id, action)
           SELECT id, 'login' FROM users WHERE email = $1`,
          [user.email]
        );

        client.release();
        return true;
      } catch (err) {
        console.error("DB Error in signIn:", err);
        return false;
      }
    },

    // Attach DB user ID to the session
    async session({ session }) {
      try {
        const result = await pool.query(
          `SELECT id FROM users WHERE email = $1`,
          [session.user.email]
        );
        if (result.rows.length > 0) {
          session.user.id = result.rows[0].id;
        }
      } catch (err) {
        console.error("DB Error in session callback:", err);
      }
      return session;
    },
  },
});
