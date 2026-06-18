export async function onRequestGet(context) {
    // Mengambil URL dan Token dari Environment Variables Cloudflare
    const dbUrl = context.env.TURSO_DB_URL;
    const authToken = context.env.TURSO_AUTH_TOKEN;

    try {
        const response = await fetch(`${dbUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "requests": [
                    { "type": "execute", "stmt": { "sql": "SELECT * FROM products" } },
                    { "type": "close" }
                ]
            })
        });

        const data = await response.json();
        
        // Memformat respons dari Turso menjadi Array of Objects yang mudah dibaca Frontend
        const result = data.results[0].response.result;
        const columns = result.cols.map(c => c.name);
        const products = result.rows.map(row => {
            let obj = {};
            row.forEach((val, i) => { obj[columns[i]] = val.value; });
            return obj;
        });

        return new Response(JSON.stringify(products), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Gagal mengambil data database" }), { status: 500 });
    }
}