"use client";

import Link from "next/link";

/** NOTE: All comments must remain in English only. */
export default function BundlesSection({
                                           eyebrow = "Scale",
                                           title = "Pricing plans",
                                           subtitle = "Flexible packages designed to match your business growth trajectory.",
                                           contentHtml = "",
                                           bgUrl = null,
                                           bgMobileUrl = null,
                                           items = [],
                                           sectionCta = null,
                                       }) {
    // Section-level rich text (top content)
    const SectionHTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none text-slate-100"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    // Card-level rich text (features)
    const CardHTML = ({ html }) => (
        <div
            className="prose max-w-none text-slate-100 text-xs md:text-sm"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    // Create a reversed copy so we do not mutate props
    const orderedItems = [...items].reverse();

    return (
        <section
            id="pricing"
            data-v="pricing"
            className="v-sec v-sec--scheme-1 relative overflow-hidden"
        >
            {/* Background images: desktop vs mobile */}
            {(bgUrl || bgMobileUrl) && (
                <>
                    {/* Desktop background */}
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Mobile background */}
                    {bgMobileUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgMobileUrl})` }}
                        />
                    )}

                    {/* Fallback: reuse desktop for mobile if mobile not set */}
                    {!bgMobileUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Dark overlay for contrast */}
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.7),_rgba(0,0,0,0.96))]"
                        aria-hidden="true"
                    />
                </>
            )}

            <div className="v-sec__container relative z-10">
                {/* Header */}
                <header
                    className="v-head v-head--center"
                    data-v="pricing-head"
                >
                    {eyebrow && (
                        <div className="v-kicker--light">{eyebrow}</div>
                    )}
                    <h2 className="v-title-xl text-slate-50">{title}</h2>
                    {subtitle && (
                        <p className="v-sub--light">{subtitle}</p>
                    )}
                    {contentHtml ? <SectionHTML html={contentHtml} /> : null}
                </header>

                {/* Cards */}
                <div
                    className="v-pricing grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8"
                    data-v="pricing-grid"
                >
                    {orderedItems.map((pkg, idx) => {
                        // Middle card = featured (like "PRO" in the reference)
                        const isFeatured = idx === 1;

                        const outerCardClasses = [
                            "relative rounded-[26px] p-[1px]",
                            "bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.8),_rgba(15,23,42,1))]",
                            isFeatured
                                ? "shadow-[0_0_55px_rgba(0,255,180,0.95)] scale-[1.03]"
                                : "shadow-[0_0_30px_rgba(15,23,42,0.9)]",
                            "transition-transform duration-300 ease-out hover:scale-[1.04]",
                        ].join(" ");

                        const innerCardClasses = [
                            "flex h-full flex-col justify-between",
                            "rounded-[24px]",
                            "bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))]",
                            "px-5 md:px-6 pt-5 pb-6 md:pt-6 md:pb-7",
                            "text-center",
                        ].join(" ");

                        const primaryCta = pkg.ctas?.[0] || null;
                        const secondaryCta = pkg.ctas?.[1] || null;

                        return (
                            <article
                                key={pkg.id || idx}
                                data-v={`price-${idx}`}
                                className={outerCardClasses}
                            >
                                <div className={innerCardClasses}>
                                    {/* Top: title + price */}
                                    <header className="flex flex-col items-center gap-2 mb-3 md:mb-4">
                                        {/* Plan name */}
                                        <h3 className="text-xs md:text-sm font-semibold tracking-[0.22em] uppercase text-slate-100">
                                            {pkg.title}
                                        </h3>

                                        {/* Price block */}
                                        {(pkg.price || pkg.per) && (
                                            <div className="mt-1 flex flex-col items-center">
                                                {pkg.price && (
                                                    <span className="text-4xl md:text-5xl font-semibold leading-none text-cyan-300 drop-shadow-[0_0_22px_rgba(34,211,238,0.9)]">
                                                        {pkg.price}
                                                    </span>
                                                )}
                                                {pkg.per && (
                                                    <span className="mt-1 text-[11px] md:text-xs text-slate-200">
                                                        {pkg.per}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Thin neon divider */}
                                        <div className="mt-4 h-px w-full rounded-full bg-gradient-to-r from-transparent via-[rgba(34,211,238,0.9)] to-transparent" />
                                    </header>

                                    {/* Middle: features */}
                                    <div className="flex-1 w-full text-left mt-1">
                                        <div
                                            className="
                                                text-xs md:text-sm leading-relaxed text-slate-100
                                                [&_ul]:list-none [&_ol]:list-none
                                                [&_li]:flex [&_li]:items-center [&_li]:gap-3
                                                [&_li]:mb-1.5
                                                [&_li::before]:content-['']
                                                [&_li::before]:block
                                                [&_li::before]:h-[2px]
                                                [&_li::before]:w-6
                                                [&_li::before]:rounded-full
                                                [&_li::before]:bg-[rgba(34,211,238,0.95)]
                                                [&_strong]:text-slate-50 [&_strong]:font-semibold
                                            "
                                        >
                                            {pkg.featuresHtml ? (
                                                <CardHTML html={pkg.featuresHtml} />
                                            ) : (
                                                <p>Details will be provided.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom: CTAs */}
                                    <div className="mt-6 flex flex-col items-center gap-3">
                                        {primaryCta?.url && (
                                            <Link
                                                href={primaryCta.url}
                                                target={primaryCta.target ?? "_self"}
                                                className="
                                                    w-full rounded-full px-4 py-2.5
                                                    text-xs md:text-sm font-semibold uppercase tracking-wide
                                                    bg-gradient-to-r from-[#008D7F] to-[#00C5FF]
                                                    text-white
                                                    shadow-[0_0_25px_rgba(0,197,255,0.7)]
                                                    hover:shadow-[0_0_35px_rgba(0,197,255,0.9)]
                                                    transition
                                                "
                                                aria-label={`${pkg.title} — ${
                                                    primaryCta.title ?? "Get started"
                                                }`}
                                            >
                                                {primaryCta.title ?? "Get Started"}
                                            </Link>
                                        )}

                                        {secondaryCta?.url && (
                                            <Link
                                                href={secondaryCta.url}
                                                target={secondaryCta.target ?? "_self"}
                                                className="text-[11px] md:text-xs font-medium text-slate-200 hover:text-cyan-300"
                                                aria-label={`${pkg.title} — ${
                                                    secondaryCta.title ?? "Learn more"
                                                }`}
                                            >
                                                {secondaryCta.title ?? "Learn More"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Section-level CTA (optional) */}
                {sectionCta?.href ? (
                    <div className="mt-10 text-center">
                        <Link
                            href={sectionCta.href}
                            target={sectionCta.target ?? "_self"}
                            className="inline-flex items-center justify-center rounded-full border border-slate-500/70 bg-slate-900/60 px-5 py-2 text-sm md:text-base text-slate-100 hover:bg-slate-800/80"
                        >
                            {sectionCta.label ?? "View all plans"}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
