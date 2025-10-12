import { gql } from '@apollo/client'
import { wp } from '../../../lib/wp'
import Image from 'next/image'
import { sanitizeHtml } from '../../../lib/sanitize'
import '../../globals.css'
import { SEO_POST, yoastToMetadata } from '@/lib/seo'

export async function generateMetadata({ params }) {
    try {
        const { data } = await wp.query({ query: SEO_POST, variables: { slug: params.slug }, fetchPolicy: 'no-cache' })
        return yoastToMetadata(data?.post?.seo)
    } catch {
        return {}
    }
}


export const dynamic = 'force-dynamic'
export const revalidate = 300

const SINGLE_POST = gql`
  query SinglePost($slug:ID!) {
    post(id:$slug, idType:SLUG) {
      title
      content
      slug
      date
      featuredImage { node { mediaItemUrl altText } }
      author { node { name } }
    }
  }
`

export default async function BlogPost({ params }) {
    const slug = params?.slug
    let post = null

    try {
        const { data } = await wp.query({ query: SINGLE_POST, variables: { slug }, fetchPolicy: 'no-cache' })
        post = data?.post ?? null
    } catch (err) {
        console.error('SINGLE_POST failed:', slug, err)
    }

    if (!post) {
        return (
            <section className="container py-16">
                <h1 className="text-3xl font-bold">Post not found</h1>
            </section>
        )
    }

    return (
        <article className="container py-10">
            <h1 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.title) }} />
            {post.featuredImage?.node?.mediaItemUrl && (
                <div className="mt-6">
                    <Image
                        src={post.featuredImage.node.mediaItemUrl}
                        alt={post.featuredImage.node?.altText || post.title}
                        width={1200} height={630} className="rounded-xl"
                    />
                </div>
            )}
            <div className="tech-single-post prose lg:prose-lg max-w-none dark:prose-invert mt-8 text-amber-50" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />
        </article>
    )
}
