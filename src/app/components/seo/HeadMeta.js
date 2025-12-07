// components/seo/HeadMeta.jsx

export default function HeadMeta({
                                     seo,
                                     faviconUrl,
                                     defaultOgImage,
                                     seoEnhancements,
                                     siteTitle,
                                     siteUrl,
                                     tagline,
                                 }) {
    // --- BASIC SEO DATA ---
    const title =
        seo?.title ||
        seo?.opengraphTitle ||
        siteTitle ||
        'Veltiqo – AI Driven Growth'

    const description =
        seo?.metaDesc ||
        seo?.opengraphDescription ||
        'AI-driven web, marketing, and automation systems that move the needle.'

    const canonical =
        typeof seo?.canonical === 'string' && seo.canonical.trim() !== ''
            ? seo.canonical.trim()
            : null

    // OG Image fallback logic
    const ogNode = seo?.opengraphImage || null
    const ogImageUrl =
        ogNode?.mediaItemUrl ||
        ogNode?.sourceUrl ||
        (ogNode?.node
            ? ogNode.node.mediaItemUrl || ogNode.node.sourceUrl
            : null) ||
        defaultOgImage ||
        null

    // --- SEO ENHANCEMENTS ---
    const keywords = (seoEnhancements?.seoKeywords || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)

    const keyphrases = (seoEnhancements?.seoKeyphrases || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)

    const contextTags = (seoEnhancements?.seoContextTags || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)

    const schemaType = (seoEnhancements?.seoSchemaType || '').trim()
    const faqBlock = seoEnhancements?.seoFaq || ''

    const keywordsContent = keywords.join(', ')
    const keyphrasesContent = keyphrases.join(' | ')
    const contextTagsContent = contextTags.join(', ')

    // ---------- FAQ PARSER ----------
    function parseFaqText(block) {
        if (!block || typeof block !== 'string') return []

        const lines = block
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)

        const faqs = []
        let q = null
        let a = null

        for (const line of lines) {
            if (line.toLowerCase().startsWith('q:')) {
                if (q && a) faqs.push({ question: q, answer: a })
                q = line.slice(2).trim()
                a = null
            } else if (line.toLowerCase().startsWith('a:')) {
                const part = line.slice(2).trim()
                a = a ? `${a} ${part}` : part
            } else if (a) {
                a += ' ' + line
            }
        }

        if (q && a) faqs.push({ question: q, answer: a })
        return faqs
    }

    // ---------- SCHEMA GENERATION ----------
    let schemaJsonLd = null
    const schemaLower = schemaType.toLowerCase()

    if (schemaLower === 'faq' || schemaLower === 'faqpage') {
        const parsed = parseFaqText(faqBlock)
        if (parsed.length > 0) {
            schemaJsonLd = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: parsed.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                })),
            }
        }
    }

    if (schemaLower === 'organization') {
        schemaJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: siteTitle,
            url: siteUrl,
            description,
        }
    }

    if (schemaLower === 'service') {
        schemaJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: title,
            description,
            provider: { '@type': 'Organization', name: siteTitle, url: siteUrl },
        }
    }

    return (
        <>
            {/* TITLE + DESCRIPTION */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {canonical && <link rel="canonical" href={canonical} />}

            {/* FAVICON (page-level fallback) */}
            {faviconUrl && (
                <>
                    <link rel="icon" href={faviconUrl} />
                    <link rel="shortcut icon" href={faviconUrl} />
                </>
            )}

            {/* TAGLINE FOR AI CONTEXT */}
            {tagline && <meta name="ai:tagline" content={tagline} />}

            {/* SEO ENHANCEMENTS */}
            {keywordsContent && (
                <>
                    <meta name="keywords" content={keywordsContent} />
                    <meta name="ai:keywords" content={keywordsContent} />
                </>
            )}

            {keyphrasesContent && (
                <meta name="ai:keyphrases" content={keyphrasesContent} />
            )}

            {contextTagsContent && (
                <meta name="ai:context-tags" content={contextTagsContent} />
            )}

            {/* RAW AI HELPERS */}
            {schemaType && <meta name="ai:schema-type" content={schemaType} />}
            {faqBlock && <meta name="ai:faq" content={faqBlock} />}

            {/* OPEN GRAPH */}
            <meta property="og:title" content={seo?.opengraphTitle || title} />
            <meta
                property="og:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
            {canonical && <meta property="og:url" content={canonical} />}

            {/* TWITTER */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo?.opengraphTitle || title} />
            <meta
                name="twitter:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

            {/* SCHEMA.ORG JSON-LD */}
            {schemaJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
                />
            )}
        </>
    )
}
