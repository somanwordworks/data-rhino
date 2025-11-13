// pages/debug-airtable.js
import { getAirtableData, getAdsData, getDownloadsData } from "../lib/airtable";

export default function DebugAirtable({ cloudStats, ads, downloads }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Airtable Debug Page</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">CloudStats</h2>
        {cloudStats.length > 0 ? (
          <ul className="list-disc ml-6">
            {cloudStats.map((item) => (
              <li key={item.id}>{item.Title} ({item.Year})</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">❌ Could not fetch CloudStats table</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Ads</h2>
        {ads.length > 0 ? (
          <ul className="list-disc ml-6">
            {ads.map((item) => (
              <li key={item.id}>{item.title} → {item.link}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">❌ Could not fetch Ads table</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Downloads</h2>
        {downloads.length > 0 ? (
          <ul className="list-disc ml-6">
            {downloads.map((item) => (
              <li key={item.id}>{item.title} ({item.category})</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-600">❌ Could not fetch Downloads table (check if it's “dowloads” in .env)</p>
        )}
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  const [cloudStats, ads, downloads] = await Promise.all([
    getAirtableData(),
    getAdsData(),
    getDownloadsData(),
  ]);

  return {
    props: { cloudStats, ads, downloads },
  };
}
