// src/app/lib/graphql/client.js
// All comments in English only.

export async function gqlRequest(query, variables = {}) {
    const ENDPOINT = process.env.NEXT_PUBLIC_CMS_URL;

    // CRITICAL FIX: Use NEXT_PUBLIC_ prefix so variables are exposed during the Build stage
    const WP_APP_USER = process.env.NEXT_PUBLIC_WP_APP_USER || "";
    const WP_APP_PASS_RAW = process.env.NEXT_PUBLIC_WP_APP_PASS || "";

    if (!ENDPOINT) throw new Error("Missing NEXT_PUBLIC_CMS_URL");

    // WP Application Passwords are shown with spaces; strip them just in case.
    const WP_APP_PASS = WP_APP_PASS_RAW.replace(/\s+/g, "");

    const headers = { "Content-Type": "application/json" };

    // Ensure we send Basic Auth only if credentials exist
    if (WP_APP_USER && WP_APP_PASS) {
        const basic = Buffer.from(`${WP_APP_USER}:${WP_APP_PASS}`).toString("base64");
        headers["Authorization"] = `Basic ${basic}`;
    }

    const res = await fetch(ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        // Use Next.js cache control for SSG/ISR queries
        next: {
            revalidate: 60,
        },
    });

    // Try to parse JSON; if server returned HTML (login page etc) show a helpful error.
    let json;
    try {
        json = await res.json();
    } catch (e) {
        const text = await res.text();
        const err = new Error(
            `Non-JSON response from GraphQL. HTTP ${res.status}. Body: ${text.slice(0, 200)}`
        );
        err.request = { query, variables };
        throw err;
    }

    if (json.errors?.length) {
        const firstMsg = json.errors[0]?.message || "GraphQL error";
        const err = new Error(firstMsg);
        err.graphQLErrors = json.errors;
        err.request = { query, variables };
        err.response = json;
        throw err;
    }

    return json.data;
}