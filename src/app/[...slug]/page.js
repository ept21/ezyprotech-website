// src/app/[...slug]/page.js

import { gql } from '@apollo/client'
import { wp } from '../../lib/wp'              // נתיב יחסי, לא אליאס
import { sanitizeHtml, absolutizeCmsUrls } from '../../lib/sanitize'


import { SEO_PAGE, yoastToMetadata } from '@/lib/seo'
export async function generateMetadata({ params }) {
    const uri = '/' + (params?.slug?.join('/') || '') + '/'
    try {
        const { data } = await wp.query({ query: SEO_PAGE, variables: { uri }, fetchPolicy: 'no-cache' })
        return yoastToMetadata(data?.page?.seo)
    } catch {
        return {}
    }
}


export const dynamic = 'force-dynamic'
export const revalidate = 300

// מכניסים את השאילתה כאן כדי לא להסתמך על '@/lib/pages'
const PAGE_BY_URI = gql`
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      content
      uri
    }
  }
`


export default async function GenericPage({ params }) {
    const uri = '/' + (params?.slug?.join('/') || '') + '/'
    let page = null

    try {
        const { data } = await wp.query({
            query: PAGE_BY_URI,
            variables: { uri },
            fetchPolicy: 'no-cache',
        })
        page = data?.page ?? null
    } catch (err) {
        console.error('PAGE_BY_URI failed:', uri, err)
    }

    if (!page) {
        return (
            <section className="container py-16">
                <h1 className="text-3xl font-bold">Not found</h1>
                <p className="mt-2 text-gray-400">The page you’re looking for does not exist.</p>
            </section>
        )
    }

    const safeTitle = sanitizeHtml(page.title)
    const safeBody  = absolutizeCmsUrls(sanitizeHtml(page.content))



    return (
        <section className="container py-10">
            <h1 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: safeTitle }} />
            <article
                className="prose lg:prose-lg max-w-none dark:prose-invert mt-6"
                dangerouslySetInnerHTML={{ __html: safeBody }}
            />
        </section>
    )
}
