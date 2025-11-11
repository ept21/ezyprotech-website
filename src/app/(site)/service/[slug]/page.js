export const revalidate = 60

import { getClient } from '@/app/lib/graphql/client'
import { SERVICE_QUERY } from '@/app/lib/graphql/queries'

export default async function Page({ params }) {
    const data = await getClient().request(SERVICE_QUERY, { slug: params.slug })
    console.log(data)
    const p = data?.service
    if (!p) return null
    return (
        <main className="py-12">
            <div className="container">
                <h1 className="text-3xl font-bold">{p.title}</h1>
                {p.featuredImage?.node?.mediaItemUrl && (
                    <img className="mt-6 rounded-lg" src={p.featuredImage.node.mediaItemUrl} alt={p.title} />
                )}
                {p.content && <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: p.content }} />}
            </div>
        </main>
    )
}
