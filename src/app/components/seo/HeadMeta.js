// components/seo/HeadMeta.jsx

export default function HeadMeta({ seo, faviconUrl, defaultOgImage }) {
    // Basic SEO values
    const title = seo?.title || "Veltiqo – AI Driven Growth";
    const description =
        seo?.description ||
        "AI-driven web, marketing, and automation systems that move the needle.";

    // OG image:
    const ogImageUrl =
        seo?.openGraph?.image?.url ||
        seo?.openGraph?.image || // in case it's just a string
        defaultOgImage ||
        null;

    const canonical = seo?.canonical || null;

    return (
        <>
            {/* Title + description */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {canonical && <link rel="canonical" href={canonical} />}

            {/* Favicon */}
            {faviconUrl && (
                <>
                    <link rel="icon" href={faviconUrl} />
                    <link rel="shortcut icon" href={faviconUrl} />
                </>
            )}

            {/* Open Graph */}
            <meta property="og:title" content={seo?.openGraph?.title || title} />
            <meta
                property="og:description"
                content={seo?.openGraph?.description || description}
            />
            {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content={seo?.openGraph?.title || title}
            />
            <meta
                name="twitter:description"
                content={seo?.openGraph?.description || description}
            />
            {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
        </>
    );
}
