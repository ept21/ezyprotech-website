// src/app/lib/seo.js

/**
 * Normalize canonical URL so it always points to the frontend domain,
 * not the WordPress CMS domain.
 */
function normalizeCanonical(rawCanonical, siteUrl) {
    if (!rawCanonical || typeof rawCanonical !== "string") return undefined;
    const trimmed = rawCanonical.trim();
    if (!trimmed) return undefined;

    try {
        // If we have a frontend siteUrl, force the canonical to use its origin
        if (siteUrl) {
            const front = new URL(siteUrl);
            const canonicalUrl = new URL(trimmed, front.origin);

            // If Yoast returned a different origin (e.g. cms.veltiqo.com),
            // we override it with the frontend origin.
            if (canonicalUrl.origin !== front.origin) {
                canonicalUrl.protocol = front.protocol;
                canonicalUrl.host = front.host;
            }

            return canonicalUrl.toString();
        }

        // If we don't have siteUrl, at least return a valid URL from Yoast
        const canonicalUrl = new URL(trimmed);
        return canonicalUrl.toString();
    } catch {
        // Fallback: best-effort – return the trimmed string
        return trimmed;
    }
}

/**
 * Map Yoast SEO fields to Next.js Metadata object
 * This is used only for:
 * - title / description
 * - canonical (via alternates)
 * - OpenGraph (basic)
 *
 * NO keywords, NO ai:* meta, NO JSON-LD here.
 */
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

    // Canonical – normalized to frontend domain if possible
    const canonical = normalizeCanonical(wpSeo?.canonical, siteUrl);

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
