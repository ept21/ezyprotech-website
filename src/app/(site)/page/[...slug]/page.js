export const revalidate = 60

import { getClient } from '@/app/lib/graphql/client'
import { PAGE_BY_SLUG_QUERY } from '@/app/lib/graphql/queries'

function joinUri(slugArray) {
    if (!slugArray || !slugArray.length) return '/'
    return `/${slugArray.join('/')}/`
}

export default async function WPPage({ params }) {
    const uri = joinUri(params.slug) // למשל ["about"] => "/about/", ["company","team"] => "/company/team/"
    const data = await getClient().request(PAGE_BY_SLUG_QUERY, { slug: uri })
    const page = data?.page

    if (!page) {
        // אפשר גם להשתמש ב-notFound() אם תרצה 404 אמיתי
        return (
            <main className="py-16">
                <div className="container">
                    <h1 className="text-2xl font-bold">Page not found</h1>
                    <p className="mt-2 text-gray-600">No page for URI: {uri}</p>
                </div>
            </main>
        )
    }

    const img = page?.featuredImage?.node?.mediaItemUrl || page?.featuredImage?.node?.sourceUrl

    return (
        <main className="py-16">
            <div className="container">
                <h1 className="text-3xl font-bold">{page.title}</h1>

                {img && (
                    <img
                        src={img}
                        alt={page.title}
                        className="mt-6 rounded-xl w-full max-w-4xl object-cover"
                    />
                )}

                {page.content && (
                    <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: page.content }} />
                )}
            </div>
        </main>
    )
}
