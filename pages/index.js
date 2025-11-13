// pages/index.js
import Head from "next/head";
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { getAirtableData, getAdsData } from "../lib/airtable";
import { fetchRssFeed } from "../lib/fetchRss";
import { fetchMeetupEvents } from "../lib/fetchMeetupEvents";
import { fetchWebinars } from "../lib/fetchWebinars";
import ScrollToTop from "../components/ScrollToTop";
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LabelList
} from "recharts";

// RSS sources
const feeds = [
    { url: "https://azure.microsoft.com/en-us/blog/feed/", source: "Microsoft", logo: "/logos/microsoft.svg" },
    { url: "https://aws.amazon.com/blogs/aws/feed/", source: "AWS", logo: "/logos/aws.svg" },
    { url: "https://cloudblog.withgoogle.com/rss/", source: "GCP", logo: "/logos/gcp.svg" },
    { url: "https://www.snowflake.com/feed/", source: "Snowflake", logo: "/logos/snowflake.svg" },
    { url: "https://www.databricks.com/feed", source: "Databricks", logo: "/logos/databricks.svg" },
];

export async function getStaticProps() {
    let airtableData = [];
    let adsData = [];
    let meetupEvents = [];
    let webinars = [];
    let rssData = [];
    let msCourses = [];

    try {
        airtableData = await getAirtableData();
        adsData = await getAdsData();

        // Meetups
        meetupEvents = await fetchMeetupEvents([
            "https://www.meetup.com/gittogether-hyderabad/events/rss/",
            "https://www.meetup.com/gittogether-bangalore/events/rss/",
            "https://www.meetup.com/gittogether-chennai/events/rss/",
        ]);

        // Webinars
        webinars = await fetchWebinars();

        // RSS news
        const results = await Promise.allSettled(
            feeds.map(async (f) => {
                const items = await fetchRssFeed(f.url, f.project || null);
                return items.map((item) => ({
                    ...item,
                    source: f.source,
                    logo: f.logo,
                }));
            })
        );
        rssData = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

        // ✅ Microsoft Learn API fetch (robust normalization + images)
        const resp = await fetch("https://learn.microsoft.com/api/catalog/?locale=en-us");
        const data = await resp.json();

        // Normalize possible shapes:
        let combined = Array.isArray(data.items)
            ? data.items.filter(
                (it) => it && it.url && ["Learning Path", "Module"].includes(it.contentType || it.content_type)
            )
            : [];

        const modules = Array.isArray(data.modules)
            ? data.modules.map((m) => ({ ...m, contentType: "Module" }))
            : [];
        const learningPaths = Array.isArray(data.learningPaths)
            ? data.learningPaths.map((lp) => ({ ...lp, contentType: "Learning Path" }))
            : [];

        combined = combined.concat(modules, learningPaths);

        // Dedupe
        const seen = new Set();
        combined = combined.filter((it) => {
            const key = it.uid || it.url;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Sort
        combined.sort((a, b) => {
            const aDate = new Date(a.lastModified || a.last_modified || a.lastUpdated || a.last_updated || 0);
            const bDate = new Date(b.lastModified || b.last_modified || b.lastUpdated || b.last_updated || 0);
            return bDate - aDate;
        });

        // ✅ Map with real image fields if available
        msCourses = combined.slice(0, 10).map((it) => ({
            id: it.uid || it.url,
            title: it.title,
            description: it.summary || "No description available",
            url: it.url,
            image:
                it.iconUrl ||
                it.thumbnailUrl ||
                (it.mediaAssets && it.mediaAssets[0] && it.mediaAssets[0].url) ||
                "/logos/microsoft.svg", // fallback
        }));

    } catch (err) {
        console.error("Microsoft Learn fetch error:", err?.message || err);
    }

    // Fallback: show a few evergreen links if API returned nothing
    if (!msCourses || msCourses.length === 0) {
        msCourses = [
            {
                id: "fallback-az-900",
                title: "Azure Fundamentals (AZ-900)",
                description: "Learn fundamental cloud concepts and Azure core services.",
                url: "https://learn.microsoft.com/training/paths/azure-fundamentals/",
                image: "/logos/microsoft.svg",
            },
            {
                id: "fallback-fabric",
                title: "Get started with Microsoft Fabric",
                description: "Core Fabric capabilities including Lakehouse and Power BI.",
                url: "https://learn.microsoft.com/training/paths/get-started-fabric/",
                image: "/logos/microsoft.svg",
            },
            {
                id: "fallback-ai-fund",
                title: "AI Fundamentals",
                description: "Basics of AI/ML and Azure AI services.",
                url: "https://learn.microsoft.com/training/paths/explore-azure-ai-services/",
                image: "/logos/microsoft.svg",
            },
            {
                id: "fallback-dp-900",
                title: "Azure Data Fundamentals (DP-900)",
                description: "Foundational data concepts on Azure data services.",
                url: "https://learn.microsoft.com/training/paths/azure-data-fundamentals/",
                image: "/logos/microsoft.svg",
            },
        ];
    }

    return {
        props: { airtableData, rssData, adsData, meetupEvents, webinars, msCourses },
        revalidate: 21600, // refresh every 6 hours
    };
}

export default function Home({
    airtableData = [],
    rssData = [],
    adsData = [],
    meetupEvents = [],
    webinars = [],
    msCourses = [],
}) {
    const [selectedSource, setSelectedSource] = useState("All");
    const [selectedProvider, setSelectedProvider] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // ---------- Charts data ----------
    const filteredData = airtableData.filter((row) => row.Year >= 2021 && row.Year <= 2025);
    const years = [...new Set(filteredData.map((row) => row.Year))].sort();
    const providers = [...new Set(filteredData.map((row) => row.Provider))];

    const marketShareData = years.map((year) => {
        const yearData = { year };
        providers.forEach((p) => {
            const entry = filteredData.find((row) => row.Year === year && row.Provider === p);
            yearData[p] = entry ? Number(entry.MarketShare) : 0;
        });
        return yearData;
    });

    const revenueData = years.map((year) => {
        const yearData = { year };
        providers.forEach((p) => {
            const entry = filteredData.find((row) => row.Year === year && row.Provider === p);
            yearData[p] = entry ? Number(entry.Revenue) : 0;
        });
        return yearData;
    });

    const latestYear = years[years.length - 1];
    const dataCentersPie = providers.map((p) => {
        const entry = filteredData.find((row) => row.Year === latestYear && row.Provider === p);
        return { name: p, value: entry ? Number(entry.DataCenters) : 0 };
    });

    const latestReportedDate = filteredData.length
        ? filteredData.reduce(
            (latest, row) =>
                new Date(row.ReportedDate) > new Date(latest) ? row.ReportedDate : latest,
            filteredData[0].ReportedDate
        )
        : null;

    const formattedReportedDate = latestReportedDate
        ? new Date(latestReportedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "";

    const PROVIDER_COLORS = {
        AWS: "#A7C7E7",
        Azure: "#C3E6CB",
        GCP: "#FFD6A5",
        Oracle: "#FFB3C6",
        Alibaba: "#D3C0F9",
        Others: "#B5EAEA",
    };

    const filteredProviders =
        selectedProvider === "All" ? providers : providers.filter((p) => p === selectedProvider);

    const filteredPieData =
        selectedProvider === "All" ? dataCentersPie : dataCentersPie.filter((p) => p.name === selectedProvider);

    // Group RSS by source
    const grouped = feeds.reduce((acc, f) => {
        acc[f.source] = [
            ...(acc[f.source] || []),
            ...rssData.filter((item) => item.source === f.source),
        ];
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <img src="/logos/d-icon.png" alt="Loading..." className="w-20 h-20 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Data Rhino</title>
                <meta name="description" content="The Newsrhino of Tech." />
            </Head>

            <Header />

            {/* Hero */}
            <div className="text-center py-10 border-b border-gray-300 relative pb-3">
                <div className="inline-block relative pb-3">
                    <img src="/logos/data-talkies.png" alt="Data Talkies" className="mx-auto w-72" />
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"></div>
                </div>
                <p className="mt-2 text-lg text-gray-600 italic">The News-Rhino of Tech.</p>
            </div>

            <div className="flex w-full">
                <div className="w-full main-scroll-container relative">

                    {/* Graphs */}
                    <div className="mt-12 px-6 relative">
                        <div className="mb-6 flex flex-wrap gap-3">
                            {["All", ...providers].map((p) => (
                                <label key={p} className="flex items-center space-x-1 cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100">
                                    <input
                                        type="radio"
                                        name="providerFilter"
                                        value={p}
                                        checked={selectedProvider === p}
                                        onChange={() => setSelectedProvider(p)}
                                        className="h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <span className="text-gray-700 text-sm">{p}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Cloud Stats (2021–2025)</h2>
                            {formattedReportedDate && (
                                <span className="text-sm font-semibold text-gray-700">
                                    Last reported: {formattedReportedDate}
                                </span>
                            )}
                        </div>

                        <Carousel>
                            {/* Market Share */}
                            <div className="min-w-[450px] bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-2">Market Share (%)</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={marketShareData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                        <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "12px" }} />
                                        {filteredProviders.map((p) => (
                                            <Bar key={p} dataKey={p} fill={PROVIDER_COLORS[p] || "#8884d8"}>
                                                <LabelList dataKey={p} position="top" formatter={(v) => `${(v * 100).toFixed(0)}%`} style={{ fontSize: 10 }} />
                                            </Bar>
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Revenue */}
                            <div className="min-w-[450px] bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-2">Revenue (in Billions)</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis domain={[0, "dataMax + 10"]} />
                                        <Tooltip formatter={(v) => `${v} B`} />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "12px" }} />
                                        {filteredProviders.map((p) => (
                                            <Line key={p} type="monotone" dataKey={p} stroke={PROVIDER_COLORS[p] || "#8884d8"} strokeWidth={2} dot={{ r: 4 }} />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Data Centers */}
                            <div className="min-w-[450px] bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold mb-2">Data Centers – {latestYear}</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie data={filteredPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {filteredPieData.map((entry, i) => (
                                                <Cell key={`cell-${i}`} fill={PROVIDER_COLORS[entry.name] || "#8884d8"} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => `${v} DCs`} />
                                        <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Carousel>
                    </div>

                    {/* ✅ Microsoft Learn Section */}
                    <div id="microsoft-learn" className="bg-gray-50 py-16 px-6">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-10">
                                Microsoft Learn — Free Courses
                            </h2>
                            <Carousel>
                                {msCourses.map((c) => (
                                    <div key={c.id} className="flex-shrink-0 min-w-[350px] max-w-md bg-white rounded-lg shadow p-4">
                                        <img src={c.image} alt={c.title} className="w-full h-40 object-cover rounded mb-3" />
                                        <h3 className="text-xl font-semibold">{c.title}</h3>
                                        <p className="mt-2 text-gray-600 text-sm">{c.description}</p>
                                        <a
                                            href={c.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                        >
                                            Start Learning →
                                        </a>
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                    </div>

                    {/* RSS Filters */}
                    <div className="flex flex-wrap justify-center gap-3 mt-10 mb-8">
                        {["All", ...feeds.map((f) => f.source)]
                            .filter((src, i, arr) => arr.indexOf(src) === i)
                            .map((src) => (
                                <button
                                    key={src}
                                    onClick={() => setSelectedSource(src)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${selectedSource === src ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                >
                                    {src}
                                </button>
                            ))}
                    </div>

                    {/* RSS Sections */}
                    <div className="mt-12 space-y-10">
                        {feeds
                            .filter((f, i, arr) => arr.findIndex(ff => ff.source === f.source) === i)
                            .filter((f) => selectedSource === "All" || f.source === selectedSource)
                            .map((f) => (
                                <div key={f.source}>
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 border-b pb-2 px-2">
                                        <img src={f.logo} alt={f.source} className="w-10 h-10 object-contain rounded-md bg-gray-50 p-1 shadow" />
                                        <span className="text-lg font-semibold">{f.source}</span>
                                    </h2>
                                    <Carousel>
                                        {(grouped[f.source] || []).map((item, idx) => (
                                            <div key={idx} className="flex-shrink-0 min-w-[350px] max-w-md bg-white rounded-lg shadow p-4">
                                                <img src={item.image || f.logo} alt={item.title} className="w-full h-40 object-cover rounded mb-3" />
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="block font-medium text-blue-600 hover:underline">
                                                    {item.title}
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1">{item.pubDate}</p>
                                            </div>
                                        ))}
                                    </Carousel>
                                </div>
                            ))}
                    </div>

                    {/* Webinars */}
                    <div id="webinars" className="mt-0 scroll-mt-24">
                        <h2 className="text-2xl font-bold text-center mb-8">
                            Upcoming & On-Demand Webinars
                        </h2>
                        <Carousel>
                            {["Databricks", "Microsoft", "AWS", "GCP", "Snowflake", "Apache"].map(
                                (provider) => {
                                    const today = new Date();
                                    const upcoming = webinars
                                        .filter((w) => w.provider === provider)
                                        .filter((w) => new Date(w.date) >= today)
                                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                                    return (
                                        <div
                                            key={provider}
                                            className="flex-shrink-0 min-w-[350px] max-w-md bg-white rounded-lg shadow p-4"
                                        >
                                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                                                <img
                                                    src={`/logos/${provider.toLowerCase()}.svg`}
                                                    alt={provider}
                                                    className="w-8 h-8"
                                                />
                                                {provider}
                                            </h3>
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                {upcoming.map((w) => (
                                                    <div
                                                        key={w.id}
                                                        className="bg-gray-50 rounded-md p-4 shadow-sm"
                                                    >
                                                        <h4 className="font-medium text-base">{w.title}</h4>
                                                        <p className="text-sm text-gray-500">{w.date}</p>
                                                        <a
                                                            href={w.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm font-semibold"
                                                        >
                                                            Register
                                                        </a>
                                                    </div>
                                                ))}
                                                {upcoming.length === 0 && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        No upcoming webinars listed.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </Carousel>
                    </div>

                    {/* Meetups */}
                    <div id="meetups" className="pt-6 mt-0 scroll-mt-40">
                        <h2 className="text-2xl font-bold text-center mb-8">
                            Tech & Community Meetups
                        </h2>
                        <Carousel>
                            {meetupEvents.length > 0 ? (
                                meetupEvents.map((event) => {
                                    const shortDesc =
                                        event.description && event.description.length > 150
                                            ? event.description.substring(0, 150) + "..."
                                            : event.description;

                                    return (
                                        <div
                                            key={event.id}
                                            className="flex-shrink-0 min-w-[350px] max-w-md bg-white rounded-lg shadow p-4"
                                        >
                                            {event.image && (
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="w-full h-40 object-cover rounded mb-3"
                                                />
                                            )}
                                            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {event.date} {event.time && `| ${event.time}`}
                                            </p>
                                            <p className="text-xs text-gray-400 mb-1">Group: {event.group}</p>
                                            {shortDesc && (
                                                <p className="text-sm text-gray-700 mb-3">{shortDesc}</p>
                                            )}
                                            <a
                                                href={event.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm font-semibold"
                                            >
                                                View Details
                                            </a>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-500 italic">
                                    No upcoming meetups right now. Please check back soon for new updates!
                                </p>
                            )}
                        </Carousel>
                    </div>

                    {/* Clientele Section */}
                    <div className="py-10 bg-white border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-center mb-8">
                            Our Clientele
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 px-6 items-center">
                            {adsData.map((ad) => (
                                <div key={ad.id} className="flex items-center justify-center h-16">
                                    {ad.image ? (
                                        <img
                                            src={ad.image}
                                            alt={ad.title}
                                            className="max-h-24 max-w-[200px] object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-500 text-sm">{ad.title}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Components */}
            <ScrollToTop />
            <Footer />
        </>
    );
}
