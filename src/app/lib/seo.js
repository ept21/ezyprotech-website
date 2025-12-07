// src/app/lib/seo.js

// Map Yoast SEO fields to Next.js Metadata object
export function yoastToMetadata({
                                    wpSeo,
                                    fallbackTitle = "Veltiqo | AI Driven Growth",
                                    fallbackDescription = "",
                                    fallbackImage = null,
                                    siteUrl = "",
                                }) {
    // Base title & description
    const title =
        wpSeo?.title ||
        wpSeo?.opengraphTitle ||
        fallbackTitle ||
        "Veltiqo | AI Driven Growth";

    const description =
        wpSeo?.metaDesc ||
        wpSeo?.opengraphDescription ||
        fallbackDescription ||
        "";

    const canonical = wpSeo?.canonical && wpSeo.canonical.trim() !== ""
        ? wpSeo.canonical.trim()
        : undefined;

    // Resolve OG image URL from Yoast or fallback image node/string
    const ogNode = wpSeo?.opengraphImage || fallbackImage || null;

    let ogImageUrl;
    if (ogNode) {
        if (typeof ogNode === "string") {
            ogImageUrl = ogNode;
        } else {
            ogImageUrl =
                ogNode.mediaItemUrl ||
                ogNode.sourceUrl ||
                (ogNode.node
                    ? ogNode.node.mediaItemUrl || ogNode.node.sourceUrl
                    : undefined);
        }
    }

    const openGraph = {
        title: wpSeo?.opengraphTitle || title,
        description: wpSeo?.opengraphDescription || description,
        url: canonical || siteUrl || undefined,
        images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    };

    const metadata = {
        title,
        description,
        openGraph,
    };

    if (canonical) {
        metadata.alternates = { canonical };
    }

    return metadata;
}

// Optional default export in case you ever import without braces
export default yoastToMetadata;
