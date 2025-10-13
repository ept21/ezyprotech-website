// src/app/page.js
import Link from 'next/link'
import { getHomeData } from '@/lib/getHomeData'

export const revalidate = 300

export default async function HomePage() {
    const {
        fields,
        heroSlides,
        badges,
        services,
        projects,
        news,
        testimonials,
        faq,
        media,
    } = await getHomeData()

    return (
        <main className="container mx-auto px-4 py-10 space-y-16">

            {/* === HERO === */}
            {fields?.heroEnable && heroSlides?.length > 0 && (
                <section aria-labelledby="home-hero">
                    <h2 id="home-hero" className="sr-only">Hero</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {heroSlides.map((s) => (
                            <Link key={s.id} href={s.uri} className="block group">
                                <div className="relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                                    <img
                                        src={s.image}
                                        alt={s.alt || s.title || 'Hero image'}
                                        className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        loading="eager"
                                        decoding="async"
                                    />
                                </div>
                                <p className="mt-2 font-semibold">{s.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* === BADGES (לוגואים/שיתופי פעולה) === */}
            {fields?.badgesEnable && badges?.length > 0 && (
                <section aria-labelledby="home-badges">
                    <h2 id="home-badges" className="text-2xl font-bold mb-4">Trusted by</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-6 items-center">
                        {badges.map((b) => (
                            <Link key={b.id} href={b.uri} className="block">
                                <img
                                    src={b.image}
                                    alt={b.alt || b.title || 'Badge'}
                                    className="h-10 w-auto mx-auto opacity-90 hover:opacity-100 transition"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* === SERVICES === */}
            {fields?.servicesEnable && services?.length > 0 && (
                <section aria-labelledby="home-services">
                    <h2 id="home-services" className="text-2xl font-bold mb-4">
                        {fields?.servicesTitle || 'Services'}
                    </h2>
                    {fields?.servicesSubtitle && (
                        <p className="text-slate-300 mb-6">{fields.servicesSubtitle}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map((s) => (
                            <Link key={s.id} href={s.uri} className="block rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-4">
                                <img
                                    src={s.image}
                                    alt={s.alt || s.title}
                                    className="w-full h-40 object-cover rounded-xl"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <p className="mt-3 font-semibold">{s.title}</p>
                            </Link>
                        ))}
                    </div>

                    {fields?.servicesShowCta && (fields?.servicesCtaText && fields?.servicesCtaUrl) && (
                        <div className="mt-6">
                            <Link
                                href={fields.servicesCtaUrl}
                                className="inline-flex rounded-2xl px-5 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 font-semibold"
                            >
                                {fields.servicesCtaText}
                            </Link>
                        </div>
                    )}
                </section>
            )}

            {/* === PROJECTS === */}
            {fields?.projectsEnable && projects?.length > 0 && (
                <section aria-labelledby="home-projects">
                    <h2 id="home-projects" className="text-2xl font-bold mb-4">
                        {fields?.projectsTitle || 'Projects'}
                    </h2>
                    {fields?.projectsSubtitle && (
                        <p className="text-slate-300 mb-6">{fields.projectsSubtitle}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map((p) => (
                            <Link key={p.id} href={p.uri} className="block rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-4">
                                <img
                                    src={p.image}
                                    alt={p.alt || p.title}
                                    className="w-full h-40 object-cover rounded-xl"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <p className="mt-3 font-semibold">{p.title}</p>
                            </Link>
                        ))}
                    </div>

                    {fields?.projectsShowCta && (fields?.projectsCtaText && fields?.projectsCtaUrl) && (
                        <div className="mt-6">
                            <Link
                                href={fields.projectsCtaUrl}
                                className="inline-flex rounded-2xl px-5 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 font-semibold"
                            >
                                {fields.projectsCtaText}
                            </Link>
                        </div>
                    )}
                </section>
            )}

            {/* === NEWS (Tech Blog/News) === */}
            {fields?.newsEnable && news?.length > 0 && (
                <section aria-labelledby="home-news">
                    <h2 id="home-news" className="text-2xl font-bold mb-4">
                        {fields?.newsTitle || 'Tech News'}
                    </h2>
                    {fields?.newsSubtitle && (
                        <p className="text-slate-300 mb-6">{fields.newsSubtitle}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {news.map((n) => (
                            <Link key={n.id} href={n.uri} className="block rounded-2xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 p-4">
                                <img
                                    src={n.image}
                                    alt={n.alt || n.title}
                                    className="w-full h-40 object-cover rounded-xl"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <p className="mt-3 font-semibold">{n.title}</p>
                                {n.excerpt && (
                                    <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: n.excerpt }} />
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* === TESTIMONIALS === */}
            {fields?.socialproofEnable && testimonials?.length > 0 && (
                <section aria-labelledby="home-testimonials">
                    <h2 id="home-testimonials" className="text-2xl font-bold mb-4">
                        {fields?.socialproofTitle || 'Testimonials'}
                    </h2>
                    {fields?.socialproofSubtitle && (
                        <p className="text-slate-300 mb-6">{fields.socialproofSubtitle}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testimonials.map((t) => (
                            <article key={t.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                                {t.image && (
                                    <img
                                        src={t.image}
                                        alt={t.alt || t.title}
                                        className="h-14 w-14 rounded-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
                                <p className="mt-2 font-semibold">{t.title}</p>
                                <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: t.html }} />
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* === FAQ === */}
            {fields?.faqEnable && faq?.length > 0 && (
                <section aria-labelledby="home-faq">
                    <h2 id="home-faq" className="text-2xl font-bold mb-4">
                        {fields?.faqTitle || 'FAQ'}
                    </h2>
                    <div className="space-y-3">
                        {faq.map((q) => (
                            <details key={q.id} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                                <summary className="font-semibold cursor-pointer">{q.question}</summary>
                                <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: q.answerHtml }} />
                            </details>
                        ))}
                    </div>
                </section>
            )}

            {/* === MEDIA (גלריה) === */}
            {fields?.mediaEnable && media?.length > 0 && (
                <section aria-labelledby="home-media">
                    <h2 id="home-media" className="text-2xl font-bold mb-4">
                        {fields?.mediaTitle || 'Media'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {media.map((m) => (
                            <Link key={m.id} href={m.uri} className="block">
                                <img
                                    src={m.image}
                                    alt={m.alt || m.title}
                                    className="w-full h-40 object-cover rounded-2xl"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <p className="mt-2 text-sm">{m.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

        </main>
    )
}
