/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "v5.airtableusercontent.com", // ✅ allow Airtable images
            },
        ],
    },

    async redirects() {
        return [];
    },

    // ✅ Add secure headers (works on Vercel)
    async headers() {
        // Slightly relaxed CSP for dev (Next’s HMR needs 'unsafe-eval')
        const isDev = process.env.NODE_ENV !== "production";
        const scriptSrc = isDev
            ? "'self' 'unsafe-inline' 'unsafe-eval'"
            : "'self' 'unsafe-inline'";

        const csp = [
            "default-src 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'",
            `script-src ${scriptSrc}`,
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' https: data:",
            "connect-src 'self' https:",
            "font-src 'self' https: data:",
            "object-src 'none'",
            "form-action 'self'",
        ].join("; ");

        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "Content-Security-Policy", value: csp },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
