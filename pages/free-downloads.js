import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";

export default function FreeDownloads() {
    const { data: session, status } = useSession();
    const [downloads, setDownloads] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/downloads");
                const data = await res.json();
                setDownloads(data);
            } catch (err) {
                console.error("Error fetching downloads:", err);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        async function fetchPrompts() {
            try {
                const res = await fetch("/api/prompts");
                const data = await res.json();
                setPrompts(data);
            } catch (err) {
                console.error("Error fetching prompts:", err);
            }
        }
        fetchPrompts();
    }, []);

    if (status === "loading") {
        return <p className="text-center mt-10">Loading...</p>;
    }

    if (!session) {
        return (
            <>
                <Header />
                <div className="flex flex-col items-center mt-20 space-y-4">
                    <h1 className="text-2xl font-bold mb-4">Downloads</h1>
                    <p className="mb-6">Please log in to access downloads.</p>

                    <button
                        onClick={() => signIn("google")}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 w-60"
                    >
                        Login with Google
                    </button>

                    <button
                        onClick={() => signIn("azure-ad")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 w-60"
                    >
                        Login with Microsoft
                    </button>
                </div>
            </>
        );
    }

    const displayName = session?.user?.email
        ? session.user.email.split("@")[0].charAt(0).toUpperCase() +
        session.user.email.split("@")[0].slice(1)
        : "";

    const filtered = downloads.filter(
        (file) =>
            (category === "All" || file.category === category) &&
            file.title?.toLowerCase().includes(query.toLowerCase())
    );
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <Header />
            <div className="px-6 py-10 relative">
                <h1 className="text-2xl font-bold mb-6">Welcome, {displayName}</h1>

                {/* Downloads Section
                <div className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Free Downloads</h2>

                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPage(1);
                            }}
                            className="border px-2 py-1 rounded w-1/2"
                        />
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setPage(1);
                            }}
                            className="border px-2 py-1 rounded"
                        >
                            <option value="All">All Categories</option>
                            <option value="AI">AI</option>
                            <option value="Data Governance">Data Governance</option>
                            <option value="Cloud">Cloud</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {paginated.map((file) => (
                            <div
                                key={file.id}
                                className="border rounded p-3 shadow-sm hover:shadow-md transition"
                            >
                                <a
                                    href={file.file}
                                    download={file.title}
                                    className="text-blue-600 hover:underline block"
                                >
                                    {file.title || "Untitled File"}
                                </a>
                                <span className="text-sm text-gray-500">
                                    ({file.downloadCount || 0} downloads)
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            ⬅ Prev
                        </button>
                        <span>Page {page}</span>
                        <button
                            disabled={page * itemsPerPage >= filtered.length}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next ➡
                        </button>
                    </div>
                </div> */}

                {/* Prompts Section */}
                <div className="mt-16 relative">
                    <h2 className="text-xl font-semibold mb-4">Prompts</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {prompts.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow p-4 flex flex-col"
                            >
                                {item.image && (
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        width={300}
                                        height={128}
                                        className="rounded-lg object-cover mb-3"
                                    />
                                )}
                                <h3 className="font-medium text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.category}</p>
                                <p className="text-xs text-gray-500 line-clamp-3">{item.prompt}</p>
                                {item.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 text-xs bg-gray-200 rounded-full"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {item.worksIn && (
                                    <p className="text-xs text-indigo-600 mt-1">
                                        Works in: {item.worksIn}
                                    </p>
                                )}
                                {item.guide && (
                                    <p className="text-xs text-gray-500 italic mt-2">💡 {item.guide}</p>
                                )}
                                <button
                                    onClick={() => navigator.clipboard.writeText(item.prompt)}
                                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                                >
                                    📋 Copy Prompt
                                </button>
                                <span className="mt-2 text-sm text-gray-600">
                                    {item.usageCount ? `${item.usageCount} copies` : "0 copies"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
