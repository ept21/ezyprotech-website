// src/components/ContactBlock.js
import React from 'react'

export default function ContactBlock({ data }) {
    if (!data?.enable) return null
    const { title, subtitle, provider, embed, formId } = data
    return (
        <section className="mx-auto max-w-4xl px-4 py-12">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>}
            {subtitle && <p className="text-white/70 mt-2">{subtitle}</p>}

            <div className="mt-6 rounded-2xl bg-neutral-900 p-6">
                {provider === 'embed_html' && embed && (
                    <div dangerouslySetInnerHTML={{ __html: embed }} />
                )}
                {provider !== 'embed_html' && (
                    <p className="text-white/70 text-sm">
                        Form provider: {provider} {formId ? `(id: ${formId})` : ''}
                    </p>
                )}
            </div>
        </section>
    )
}
