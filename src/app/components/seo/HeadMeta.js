// components/seo/HeadMeta.jsx

export default function HeadMeta({
                                     seo,
                                     faviconUrl,
                                     defaultOgImage,
                                     siteTitle,
                                     siteUrl,
                                 }) {
    // ---------- BASIC SEO ----------
    const fallbackTitle = siteTitle || 'Veltiqo – AI Driven Growth';

    const title =
        seo?.title ||
        seo?.opengraphTitle ||
        fallbackTitle;

    const description =
        seo?.metaDesc ||
        seo?.opengraphDescription ||
        'AI-driven web, marketing, and automation systems that move the needle.';

    const canonical =
        typeof seo?.canonical === 'string' && seo.canonical.trim() !== ''
            ? seo.canonical.trim()
            : null;

    // ---------- OG IMAGE ----------
    const ogNode = seo?.opengraphImage || null;

    const ogImageUrl =
        ogNode?.mediaItemUrl ||
        ogNode?.sourceUrl ||
        (ogNode?.node
            ? ogNode.node.mediaItemUrl || ogNode.node.sourceUrl
            : null) ||
        defaultOgImage ||
        null;

    return (
        <>
            {/* TITLE + DESCRIPTION */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* CANONICAL */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* PAGE-LEVEL FAVICON (fallback) */}
            {faviconUrl && (
                <>
                    <link rel="icon" href={faviconUrl} />
                    <link rel="shortcut icon" href={faviconUrl} />
                </>
            )}

            {/* NO KEYWORDS META
                No ai:keywords
                No metaKeywords from Yoast
                Completely removed by design.
            */}

            {/* OPEN GRAPH */}
            <meta property="og:title" content={seo?.opengraphTitle || title} />
            <meta
                property="og:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
            {canonical && <meta property="og:url" content={canonical} />}
            {siteTitle && <meta property="og:site_name" content={siteTitle} />}

            {/* TWITTER */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={seo?.opengraphTitle || title} />
            <meta
                name="twitter:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

            {/* ❌ NO SCHEMA HERE
                JSON-LD is injected ONLY at page level inside <head>
                via Next.js generateMetadata / or <script ld+json>.
            */}
        </>
    );
}
