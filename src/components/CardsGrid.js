// src/components/CardsGrid.js
import React from 'react'

export default function CardsGrid({ title, subtitle, items = [], cta }) {
    if (!items?.length) return null
    return (
        <section className="mx-auto max-w-7xl px-4 py-10">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-white/70 mt-2">{subtitle}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {items.map((it) => (
                    <a key={it.id} href={it.uri || '#'} className="block rounded-2xl overflow-hidden bg-neutral-900/60 hover:bg-neutral-900 transition">
                        {it.image?.url ? (
                            <img src={it.image.url} alt={it.image.alt || ''} className="w-full h-48 object-cover" />
                        ) : (
                            <div className="h-48 bg-neutral-800" />
                        )}
                        <div className="p-5">
                            <h3 className="text-white font-semibold">{it.title}</h3>
                            {it.excerpt && <div className="prose prose-invert text-sm mt-2" dangerouslySetInnerHTML={{ __html: it.excerpt }} />}
                        </div>
                    </a>
                ))}
            </div>
            {cta?.text && cta?.url && (
                <div className="mt-6">
                    <a href={cta.url} className="inline-block rounded-xl bg-white/10 text-white px-5 py-3 hover:bg-white/15">
                        {cta.text}
                    </a>
                </div>
            )}
        </section>
    )
}
