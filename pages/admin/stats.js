export async function getServerSideProps(context) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/stats`, {
        headers: {
            cookie: context.req.headers.cookie || "",
        },
    });

    const data = await res.json();

    return {
        props: { data },
    };
}

export default function AdminStats({ data }) {
    return (
        <div style={{ padding: "40px" }}>
            <h1>Admin Stats</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
