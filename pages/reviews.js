import { useState } from "react";
import { getSession } from "next-auth/react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ReviewsPage({ session }) {
    const [company, setCompany] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [externalReviews, setExternalReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // 🔍 Search handler
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchInput) return;

        setLoading(true);
        setCompany(searchInput);
        setPage(1);

        try {
            // External reviews
            const extRes = await fetch(
                `/api/reviews/external?company=${searchInput}&page=1&pageSize=${pageSize}`
            );
            const extData = await extRes.json();
            setExternalReviews(extData.reviews || []);
            setTotal(extData.total || 0);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Handle pagination
    const handlePageChange = async (newPage, newPageSize = pageSize) => {
        if (!company) return;
        setPage(newPage);
        setPageSize(newPageSize);

        try {
            const extRes = await fetch(
                `/api/reviews/external?company=${company}&page=${newPage}&pageSize=${newPageSize}`
            );
            const extData = await extRes.json();
            setExternalReviews(extData.reviews || []);
            setTotal(extData.total || 0);
        } catch (err) {
            console.error("Pagination error:", err);
        }
    };

    return (
        <>
            <Header />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-center mb-6">
                    🦏 Company Reviews Hub
                </h1>

                {/* 🔍 Search Bar */}
                <form onSubmit={handleSearch} className="flex mb-8">
                    <input
                        type="text"
                        placeholder="Search company (e.g., Microsoft)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>

                {loading && <p className="text-gray-500">Loading reviews...</p>}

                {/* 🌐 External Reviews */}
                {externalReviews.length > 0 ? (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">
                            External Reviews for {company} 
                        </h2>
                        {externalReviews.map((r, i) => (
                            <div
                                key={i}
                                className="bg-white shadow rounded-lg p-4 mb-3 border"
                            >
                                <p className="text-gray-700">{r.text}</p>
                                <p className="text-sm text-gray-500 mt-2">{r.date}</p>
                            </div>
                        ))}

                        {/* Pagination + Page Size */}
                        <div className="flex justify-between items-center mt-4">
                            <div>
                                <button
                                    disabled={page === 1}
                                    onClick={() => handlePageChange(page - 1)}
                                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    disabled={page * pageSize >= total}
                                    onClick={() => handlePageChange(page + 1)}
                                    className="ml-2 px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div>
                                <label className="mr-2 text-sm">Reviews per page:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) =>
                                        handlePageChange(1, parseInt(e.target.value))
                                    }
                                    className="border rounded px-2 py-1"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                            <span>
                                Page {page} of {Math.ceil(total / pageSize) || 1}
                            </span>
                        </div>
                    </div>
                ) : (
                    !loading && company && (
                        <p className="text-gray-500">No reviews found for {company}.</p>
                    )
                )}
            </div>

            <Footer />
        </>
    );
}

// 🔒 Protect Reviews page (only logged in users can access)
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/api/auth/signin",
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
}
