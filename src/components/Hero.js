// src/components/Hero.js
import React from 'react'

export default function Hero({ layout = 'single', slides = [] }) {
    if (!slides?.length) return null
    const first = slides[0]

    if (layout === 'gallery') {
        return (
            <section className="relative mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slides.map((s, i) => (
                        <a key={i} href={s.link || '#'} className="group block rounded-2xl overflow-hidden bg-neutral-900/50">
                            {s.image?.url ? (
                                <img src={s.image.url} alt={s.image.alt || ''} className="w-full h-56 object-cover group-hover:opacity-90 transition" />
                            ) : (
                                <div className="h-56 bg-neutral-800" />
                            )}
                            {(s.title || s.caption) && (
                                <div className="p-4">
                                    {s.title && <h3 className="text-white font-semibold">{s.title}</h3>}
                                    {s.caption && <div className="prose prose-invert text-sm opacity-80" dangerouslySetInnerHTML={{ __html: s.caption }} />}
                                </div>
                            )}
                        </a>
                    ))}
                </div>
            </section>
        )
    }

    // default: single / split (מציגים את הראשון בינתיים)
    return (
        <section className="relative mx-auto max-w-7xl px-4 py-14 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
                {first?.title && <h1 className="text-3xl md:text-5xl font-bold text-white">{first.title}</h1>}
                {first?.caption && <div className="prose prose-invert mt-4" dangerouslySetInnerHTML={{ __html: first.caption }} />}
                {first?.link && (
                    <a href={first.link} className="inline-block mt-6 rounded-xl bg-white/10 text-white px-5 py-3 hover:bg-white/15">
                        Learn more
                    </a>
                )}
            </div>
            <div className="flex-1 w-full">
                {first?.image?.url ? (
                    <img src={first.image.url} alt={first.image.alt || ''} className="w-full h-80 object-cover rounded-2xl" />
                ) : (
                    <div className="w-full h-80 rounded-2xl bg-neutral-800" />
                )}
            </div>
        </section>
    )
}
