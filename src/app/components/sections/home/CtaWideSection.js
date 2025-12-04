"use client";

import Link from "next/link";

/** NOTE: All comments must remain in English only. */
export default function CtaWideSection({
                                           eyebrow = "Accelerate",
                                           title = "Ready to accelerate your business?",
                                           subtitle = "Let's discuss how our AI-driven solutions can transform your business strategy and performance.",
                                           contentHtml = "",
                                           bgUrl = null,
                                           imageUrl = null,
                                           primaryCta = null,   // { url, title, target }
                                           secondaryCta = null, // { url, title, target }
                                       }) {
    // Helper to safely render WYSIWYG HTML
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-2xl mx-auto mt-4"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const sectionBgStyle = bgUrl
        ? {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",

}
        : undefined;

    // Normalize CTAs with fallbacks
    const primaryHref = primaryCta?.url || "/contact";
    const primaryLabel = primaryCta?.title || "Get started";
    const primaryTarget = primaryCta?.target || "_self";

    const secondaryHref = secondaryCta?.url || "#book-consultation";
    const secondaryLabel = secondaryCta?.title || "Book consultation";
    const secondaryTarget = secondaryCta?.target || "_self";

    return (
        <section
            id="ctasection"
            className="v-sec v-sec--scheme-1 relative bg-center bg-cover bg-no-repeat"
            data-v="cta"
            style={sectionBgStyle}
        >
            {/* Optional dark overlay if background image exists */}
            {bgUrl && (
                <div
                    className="absolute inset-0 bg-black/40"
                    aria-hidden="true"
                />
            )}

            <div className="v-sec__container relative z-10">
                <header className="v-head v-head--center">
                    {eyebrow && (
                        <p className="v-kicker v-kicker--light">
                            {eyebrow}
                        </p>
                    )}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* CTA buttons */}
                <div className="v-actions">
                    <Link
                        href={primaryHref}
                        target={primaryTarget}
                        className="btn-brand"
                    >
                        {primaryLabel}
                    </Link>
                    <Link
                        href={secondaryHref}
                        target={secondaryTarget}
                        className="btn-pill btn-pill--light"
                    >
                        {secondaryLabel}
                    </Link>
                </div>

                {/* Wide image below CTAs, if provided */}
                {imageUrl && (
                    <img
                        className="v-img-wide"
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                    />
                )}
            </div>
        </section>
    );
}
