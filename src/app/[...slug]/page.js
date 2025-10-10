// src/app/[...slug]/page.js
import { wp } from '@/lib/wp'
import { gql } from '@apollo/client'

export const revalidate = 300

const PAGE_QUERY = gql`
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      slug
      content
    }
  }
`

export default async function GenericPage({ params: paramsPromise }) {
    // ✅ חובה להמתין ל-params
    const { slug = [] } = await paramsPromise
    // slug תמיד מערך; עוטפים עם "/" בתחילה כדי להתאים ל-URI של וורדפרס
    const uri = '/' + slug.join('/')

    const { data } = await wp.query({ query: PAGE_QUERY, variables: { uri } })
    const page = data?.page

    if (!page) {
        return (
            <div className="py-16 text-center text-zinc-400">
                Not found
            </div>
        )
    }

    return (
        <article className="prose prose-zinc max-w-3xl">
            <h1 dangerouslySetInnerHTML={{ __html: page.title }} />
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
    )
}
