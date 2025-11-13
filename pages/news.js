import { useEffect, useState } from "react";
import Header from "../components/Header";  
import Footer from "../components/Footer";  
import ScrollToTop from "../components/ScrollToTop";   // ✅ Import it

export default function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("/api/news")
      .then(res => res.json())
      .then(data => setNews(data));
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* ✅ Universal Header */}
      <Header />

      <main className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-center mb-2">🦏 Data Rhino Tech News</h1>
        <p className="text-center text-gray-600 mb-8">
          Your daily dose of AI, Cloud & Data updates
        </p>

        {/* ✅ News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}
              <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
              <p className="text-sm text-gray-600 mb-3">
                {item.summary?.slice(0, 150)}...
              </p>
              <p className="text-xs text-gray-500">
                {item.source} | {new Date(item.date).toLocaleDateString()}
              </p>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium mt-2 inline-block"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      </main>

      {/* ✅ Universal Footer */}
      <Footer />

      {/* ✅ Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
