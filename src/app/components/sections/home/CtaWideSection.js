// /src/app/components/sections/home/CtaWideSection.jsx
"use client";

import Link from "next/link";

/** NOTE: All comments must remain in English only. */
export default function CtaWideSection({
                                           eyebrow = "Accelerate",
                                           title = "Ready to accelerate your business?",
                                           subtitle = "Let's discuss how our AI-driven solutions can transform your business strategy and performance.",
                                           contentHtml = "",
                                           bgUrl = null,
                                           mobileBgUrl = null,
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
            data-v="cta"
            className="v-sec v-sec--scheme-1 relative overflow-hidden"
            role="region"
            aria-label="Call to action"
        >
            {/* Background: desktop + mobile, fixed only on desktop */}
            {bgUrl || mobileBgUrl ? (
                <>
                    {/* Desktop background (fixed) */}
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat bg-fixed"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Mobile background (no fixed to avoid issues) */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                        style={{ backgroundImage: `url(${mobileBgUrl || bgUrl || ""})` }}
                    />

                    {/* Dark wash over background for readability */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-900/85"
                    />
                </>
            ) : (
                // Fallback dark gradient if no image
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
                />
            )}

            <div className="v-sec__container relative z-10">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && (
                        <p className="v-kicker v-kicker--light">
                            {eyebrow}
                        </p>
                    )}
                    <h2 className="v-title-xl text-white">{title}</h2>
                    {subtitle && (
                        <p className="v-sub text-slate-200">
                            {subtitle}
                        </p>
                    )}
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
