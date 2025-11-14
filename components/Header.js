import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
    const { data: session } = useSession();
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [redirectTarget, setRedirectTarget] = useState("/");
    const router = useRouter();

    // ✅ Updated Navigation Logic
    const buildNavLinks = () => {
        // HOME PAGE → includes Webinars + Meetups
        if (router.pathname === "/") {
            return [
                { href: "/reviews", label: "Rhino Reviews" },
                { href: "/free-downloads", label: "Downloads" },
                { href: "/news", label: "Tech News" },
                { href: "#webinars", label: "Webinars" },
                { href: "#meetups", label: "Meetups" },
                { href: "/services", label: "Services" },
            ];
        }

        // OTHER PAGES → NO Webinars or Meetups
        return [
            { href: "/reviews", label: "Rhino Reviews" },
            { href: "/free-downloads", label: "Downloads" },
            { href: "/news", label: "Tech News" },
            { href: "/services", label: "Services" },
        ];
    };

    // 🔒 Protected pages handling
    const handleProtectedClick = (e, target) => {
        if (
            !session &&
            (target === "/free-downloads" || target === "/reviews")
        ) {
            e.preventDefault();
            setRedirectTarget(target);
            setShowLoginPopup(true);
        }
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shadow-sm">

            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
                <img
                    src="/logos/data-rhino.png"
                    alt="Data Rhino"
                    className="h-12 w-auto cursor-pointer hover:opacity-80 transition"
                />
            </Link>

            {/* Center: Nav Links */}
            <nav className="flex items-center gap-6 text-zinc-700 font-medium">
                {/* Active link highlighting */}
                {buildNavLinks().map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleProtectedClick(e, link.href)}
                        className={`flex items-center pb-1 hover:text-blue-600 border-b-4 transition-all ${router.pathname === link.href ? "border-[#00AEEF] text-[#00AEEF]" : "border-transparent"}`}
                    >
                        {link.label}

                        {/* Lock icon for protected pages */}
                        {!session &&
                            (link.href === "/free-downloads" || link.href === "/reviews") && (
                                <span className="ml-1">🔒</span>
                            )}
                    </Link>
                ))}
            </nav>

            {/* Right: Logout */}
            <div className="flex items-center">
                {session && (
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                        🚪 Logout
                    </button>
                )}
            </div>

            {/* Login Popup */}
            {showLoginPopup && !session && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg shadow-sm w-80">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            Please login to continue
                        </h2>

                        <button
                            onClick={() => signIn("google", { callbackUrl: redirectTarget })}
                            className="w-full mb-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Login with Google
                        </button>

                        <button
                            onClick={() => signIn("azure-ad", { callbackUrl: redirectTarget })}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Login with Microsoft
                        </button>

                        <button
                            onClick={() => setShowLoginPopup(false)}
                            className="mt-4 w-full px-4 py-2 bg-zinc-200 text-zinc-800 rounded-lg hover:bg-zinc-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
