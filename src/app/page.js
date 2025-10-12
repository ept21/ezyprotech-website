// src/app/page.js
import { getHomeData } from '@/lib/getHomeData'
import Link from 'next/link'

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
            {/* HERO */}
            {fields?.heroEnable && heroSlides?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Hero</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {heroSlides.map(s => (
                            <Link key={s.id} href={s.uri} className="block">
                                <img src={s.image} alt={s.alt || s.title} className="w-full h-40 object-cover rounded-xl" />
                                <p className="mt-2 text-sm">{s.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* BADGES */}
            {fields?.badgesEnable && badges?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Badges</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
                        {badges.map(b => (
                            <Link key={b.id} href={b.uri} className="block">
                                <img src={b.image} alt={b.alt || b.title} className="h-10 w-auto mx-auto" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* SERVICES */}
            {fields?.servicesEnable && services?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.map(s => (
                            <Link key={s.id} href={s.uri} className="block p-4 rounded-xl bg-white/5 hover:bg-white/10">
                                <img src={s.image} alt={s.alt || s.title} className="w-full h-40 object-cover rounded-lg" />
                                <p className="mt-2 font-semibold">{s.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS */}
            {fields?.projectsEnable && projects?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Projects</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map(p => (
                            <Link key={p.id} href={p.uri} className="block p-4 rounded-xl bg-white/5 hover:bg-white/10">
                                <img src={p.image} alt={p.alt || p.title} className="w-full h-40 object-cover rounded-lg" />
                                <p className="mt-2 font-semibold">{p.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* NEWS */}
            {fields?.newsEnable && news?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Tech News</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {news.map(n => (
                            <Link key={n.id} href={n.uri} className="block p-4 rounded-xl bg-white/5 hover:bg-white/10">
                                <img src={n.image} alt={n.alt || n.title} className="w-full h-40 object-cover rounded-lg" />
                                <p className="mt-3 font-semibold">{n.title}</p>
                                {n.excerpt && (
                                    <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: n.excerpt }} />
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* TESTIMONIALS */}
            {fields?.socialproofEnable && testimonials?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Testimonials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {testimonials.map(t => (
                            <div key={t.id} className="p-4 rounded-xl bg-white/5">
                                {t.image && <img src={t.image} alt={t.alt || t.title} className="h-16 w-16 rounded-full" />}
                                <p className="mt-2 font-semibold">{t.title}</p>
                                <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: t.html }} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FAQ */}
            {fields?.faqEnable && faq?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">FAQ</h2>
                    <div className="space-y-3">
                        {faq.map(q => (
                            <details key={q.id} className="rounded-xl bg-white/5 p-3">
                                <summary className="font-semibold">{q.question}</summary>
                                <div className="prose dark:prose-invert mt-2" dangerouslySetInnerHTML={{ __html: q.answerHtml }} />
                            </details>
                        ))}
                    </div>
                </section>
            )}

            {/* MEDIA */}
            {fields?.mediaEnable && media?.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4">Media</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {media.map(m => (
                            <Link key={m.id} href={m.uri} className="block">
                                <img src={m.image} alt={m.alt || m.title} className="w-full h-40 object-cover rounded-xl" />
                                <p className="mt-2 text-sm">{m.title}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
