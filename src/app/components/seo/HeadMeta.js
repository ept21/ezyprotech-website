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
    // --- Normalize Yoast-style SEO object ---

    // Title
    const title =
        seo?.title ||
        seo?.opengraphTitle ||
        siteTitle ||
        "Veltiqo – AI Driven Growth";

    // Description (Yoast uses metaDesc / opengraphDescription)
    const description =
        seo?.metaDesc ||
        seo?.opengraphDescription ||
        "AI-driven web, marketing, and automation systems that move the needle.";

    // Canonical
    const canonical =
        typeof seo?.canonical === "string" && seo.canonical.trim() !== ""
            ? seo.canonical.trim()
            : null;

    // OG image: Yoast or fallback
    const ogNode = seo?.opengraphImage || null;
    let ogImageUrl =
        ogNode?.mediaItemUrl ||
        ogNode?.sourceUrl ||
        (ogNode?.node
            ? ogNode.node.mediaItemUrl || ogNode.node.sourceUrl
            : null) ||
        defaultOgImage ||
        null;

    // --- SEO Enhancements parsing ---

    const rawKeywords = seoEnhancements?.seoKeywords || "";
    const rawKeyphrases = seoEnhancements?.seoKeyphrases || "";
    const rawContextTags = seoEnhancements?.seoContextTags || "";
    const schemaType = seoEnhancements?.seoSchemaType || "";
    const faqBlock = seoEnhancements?.seoFaq || "";

    const keywords = rawKeywords
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const keyphrases = rawKeyphrases
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const contextTags = rawContextTags
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const keywordsContent = keywords.join(", ");
    const keyphrasesContent = keyphrases.join(" | ");
    const contextTagsContent = contextTags.join(", ");

    function parseFaqText(block) {
        if (!block || typeof block !== "string") return [];

        const lines = block
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const faqs = [];
        let currentQ = null;
        let currentA = null;

        for (const line of lines) {
            if (line.toLowerCase().startsWith("q:")) {
                if (currentQ && currentA) {
                    faqs.push({ question: currentQ, answer: currentA });
                }
                currentQ = line.slice(2).trim();
                currentA = null;
            } else if (line.toLowerCase().startsWith("a:")) {
                currentA = line.slice(2).trim();
            } else {
                if (currentA) {
                    currentA += " " + line;
                }
            }
        }

        if (currentQ && currentA) {
            faqs.push({ question: currentQ, answer: currentA });
        }

        return faqs;
    }

    let schemaJsonLd = null;

    if (schemaType === "FAQPage") {
        const parsedFaqs = parseFaqText(faqBlock);

        if (parsedFaqs.length > 0) {
            schemaJsonLd = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: parsedFaqs.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                    },
                })),
            };
        }
    } else if (schemaType === "Organization") {
        if (siteTitle && siteUrl) {
            schemaJsonLd = {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteTitle,
                url: siteUrl,
                description: description,
            };
        }
    }

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

            {/* Default tagline as an extra AI hint (optional) */}
            {tagline && <meta name="ai:tagline" content={tagline} />}

            {/* SEO / AEO keywords and context tags */}
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

            {/* Open Graph */}
            <meta property="og:title" content={seo?.opengraphTitle || title} />
            <meta
                property="og:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
            {canonical && <meta property="og:url" content={canonical} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content={seo?.opengraphTitle || title}
            />
            <meta
                name="twitter:description"
                content={seo?.opengraphDescription || description}
            />
            {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

            {/* Schema.org JSON-LD */}
            {schemaJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schemaJsonLd),
                    }}
                />
            )}
        </>
    );
}
