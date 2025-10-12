// src/components/FAQ.js
import React from 'react'

export default function FAQ({ title = 'FAQ', items = [] }) {
    if (!items?.length) return null
    return (
        <section className="mx-auto max-w-5xl px-4 py-10">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>}
            <div className="mt-6 divide-y divide-white/10">
                {items.map((f) => (
                    <details key={f.id} className="py-4">
                        <summary className="cursor-pointer text-white font-medium">{f.q}</summary>
                        {f.a && <div className="prose prose-invert mt-3" dangerouslySetInnerHTML={{ __html: f.a }} />}
                    </details>
                ))}
            </div>
        </section>
    )
}
