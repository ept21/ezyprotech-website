import { wp } from '@/lib/wp'
import { HOME_QUERY } from '@/lib/home'
import { getSiteData } from '@/lib/site'
import { sanitizeHtml, absolutizeCmsUrls } from '@/lib/sanitize'


export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function Home() {
    let page = null
    let primary = '#22d3ee', accent = '#7c3aed'

    try {
        const { data } = await wp.query({ query: HOME_QUERY, fetchPolicy: 'no-cache' })
        page = data?.page ?? null
    } catch (e) { console.error('HOME_QUERY failed:', e) }

    try {
        const site = await getSiteData().catch(() => null)
        if (site?.opts?.brandPrimary) primary = site.opts.brandPrimary
        if (site?.opts?.brandAccent)  accent  = site.opts.brandAccent
    } catch (e) {}

    const gradient = { backgroundImage: `linear-gradient(90deg, ${primary}, ${accent})` }
    const safeBody = sanitizeHtml(page?.content)
    const html = absolutizeCmsUrls(safeBody)

    if (!safeBody) {
        return (
            <section className="container py-12">
                <h1 className="text-3xl font-bold">EzyProTech</h1>
                <p className="mt-4 text-gray-400">No homepage content found yet.</p>
                <div className="mt-6 h-2 w-40 rounded-full" style={gradient} />
            </section>
        )
    }

    return (
        <section className="container py-10 home-page">
            <div className="mb-8 h-1.5 w-40 rounded-full" style={gradient} />
            <article className="prose lg:prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
        </section>
    )
}
