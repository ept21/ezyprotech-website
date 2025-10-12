// src/components/Badges.js
import React from 'react'

export default function Badges({ items = [] }) {
    if (!items?.length) return null
    return (
        <section className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center">
                {items.map((b, i) => {
                    const img = b.image
                    const Tag = b.link ? 'a' : 'div'
                    return (
                        <Tag key={i} href={b.link || undefined} className="opacity-80 hover:opacity-100 transition block text-center">
                            {img?.url ? (
                                <img src={img.url} alt={img.alt || ''} className="mx-auto h-10 object-contain" />
                            ) : (
                                <div className="h-10 bg-neutral-800 rounded" />
                            )}
                        </Tag>
                    )
                })}
            </div>
        </section>
    )
}
