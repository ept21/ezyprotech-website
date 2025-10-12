import { gql } from '@apollo/client'
import { wp } from '../../lib/wp'
import Link from 'next/link'
import Image from 'next/image'
import { sanitizeHtml } from '../../lib/sanitize'

export const dynamic = 'force-dynamic'
export const revalidate = 300

const POSTS_LIST = gql`
  query PostsList($first:Int=12) {
    posts(first:$first, where:{status:PUBLISH}) {
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage { node { mediaItemUrl altText } }
        author { node { name } }
      }
    }
  }
`

export default async function BlogIndex() {
    let posts = []
    try {
        const { data } = await wp.query({ query: POSTS_LIST, fetchPolicy: 'no-cache' })
        posts = data?.posts?.nodes ?? []
    } catch (err) {
        console.error('POSTS_LIST failed:', err)
    }

    return (
        <section className="container py-10">
            <h1 className="text-3xl font-bold">Tech Blog</h1>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
                {posts.map(p => (
                    <li key={p.id} className="border border-white/10 rounded-2xl p-4 hover:shadow-soft">
                        <Link href={`/tech-blog/${p.slug}`}>
                            {p.featuredImage?.node?.mediaItemUrl && (
                                <Image
                                    src={p.featuredImage.node.mediaItemUrl}
                                    alt={p.featuredImage.node?.altText || p.title}
                                    width={640} height={360} className="rounded-xl"
                                />
                            )}
                            <h3 className="mt-3 text-lg font-semibold" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.title) }} />
                            <div className="prose prose-sm dark:prose-invert text-gray-300 mt-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.excerpt) }} />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
