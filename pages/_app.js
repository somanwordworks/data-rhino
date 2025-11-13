// pages/_app.js
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function RouteSpinner() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const start = () => setLoading(true);
        const end = () => setLoading(false);

        router.events.on("routeChangeStart", start);
        router.events.on("routeChangeComplete", end);
        router.events.on("routeChangeError", end);

        return () => {
            router.events.off("routeChangeStart", start);
            router.events.off("routeChangeComplete", end);
            router.events.off("routeChangeError", end);
        };
    }, [router]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <img
                src="/logos/d-icon.png"
                alt="Loading..."
                className="h-16 w-16 animate-spin"
            />
        </div>
    );
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
    // ✅ Global maintenance mode check
    if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <h1 className="text-4xl font-bold">🚧 Site Under Maintenance</h1>
                <p className="mt-4 text-lg text-gray-600">
                    We’re performing some upgrades. Please check back soon!
                </p>
            </div>
        );
    }

    return (
        <SessionProvider session={session}>
            <RouteSpinner /> {/* ✅ global spinner */}
            <Component {...pageProps} />
        </SessionProvider>
    );
}
