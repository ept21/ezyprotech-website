import { gql } from '@apollo/client'
import { wp } from '@/lib/wp'
import Link from 'next/link'
import Image from 'next/image'
import { sanitizeHtml, absolutizeCmsUrls } from '@/lib/sanitize'
import { yoastToMetadata } from '@/lib/seo'

const Q = gql`
  query TagBySlug($slug: ID!, $first:Int=12) {
    tag(id: $slug, idType: SLUG) {
      name
      slug
      seo { title metaDesc canonical }
      posts(first:$first) {
        nodes {
          id
          title
          slug
          excerpt
          featuredImage { node { mediaItemUrl altText } }
        }
      }
    }
  }
`

export async function generateMetadata({ params }) {
    const { data } = await wp.query({
        query: Q,
        variables: { slug: params.slug },
        fetchPolicy: 'no-cache',
    })
    return yoastToMetadata(data?.Tag?.seo)
}

export default async function TagPage({ params }) {
    const { data } = await wp.query({
        query: Q,
        variables: { slug: params.slug },
        fetchPolicy: 'no-cache',
    })
    const cat = data?.Tag
    if (!cat) return <section className="container py-12"><h1>Tag not found</h1></section>

    const posts = cat.posts?.nodes ?? []
    return (
        <section className="container py-12">
            <h1 className="text-3xl font-bold">{cat.name}</h1>
            <ul className="grid md:grid-cols-3 gap-6 mt-8">
                {posts.map(p => (
                    <li key={p.id} className="border border-white/10 rounded-2xl p-4">
                        <Link href={`/tech-blog/${p.slug}`}>
                            {p.featuredImage?.node?.mediaItemUrl && (
                                <Image
                                    src={p.featuredImage.node.mediaItemUrl}
                                    alt={p.featuredImage.node?.altText || p.title}
                                    width={640}
                                    height={360}
                                    className="rounded-xl"
                                />
                            )}
                            <h3
                                className="mt-3 text-lg font-semibold"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.title) }}
                            />
                            <div
                                className="prose prose-sm dark:prose-invert mt-2"
                                dangerouslySetInnerHTML={{
                                    __html: absolutizeCmsUrls(sanitizeHtml(p.excerpt)),
                                }}
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
