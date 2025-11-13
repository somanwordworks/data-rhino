import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  if (status === "loading") return <p className="mt-10 text-center">Loading...</p>;

  if (!session) {
    return (
      <div className="flex flex-col items-center mt-20">
        <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-6">You must log in as admin to view this page.</p>
        <button
          onClick={() => signIn()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  if (session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return <p className="mt-20 text-center text-red-600">Access Denied</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <table className="w-full border-collapse border border-gray-300 shadow-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-300 px-4 py-2">Provider</th>
            <th className="border border-gray-300 px-4 py-2">Total Downloads</th>
            <th className="border border-gray-300 px-4 py-2">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{row.email}</td>
              <td className="border border-gray-300 px-4 py-2">{row.provider}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {row.total_downloads}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {row.last_login ? new Date(row.last_login).toLocaleString() : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
