// All comments in English only.
import { gqlRequest } from "@/app/lib/graphql/client";

export async function GET() {
    try {
        const data = await gqlRequest(`query { generalSettings { title url } }`);
        return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
    } catch (err) {
        return new Response(
            JSON.stringify({
                ok: false,
                error: err.message,
                details: err.graphQLErrors || null,
            }),
            { status: 500 }
        );
    }
}
