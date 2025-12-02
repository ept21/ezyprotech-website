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
    // Section-level rich text (above the grid)
    const SectionHTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none text-white"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    // Card-level rich text (inside each bundle card)
    // NOTE: Different classes so you can style it independently from the header content.
    const CardHTML = ({ html }) => (
        <div
            className="prose max-w-none text-xs mt-[-35px] md:text-sm"
            // If you want dark text inside cards later, you can change to:
            // className="prose max-w-none text-black text-xs md:text-sm"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

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

                    {/* Mobile background (if provided) */}
                    {bgMobileUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgMobileUrl})` }}
                        />
                    )}

                    {/* Fallback: if mobile image is missing, reuse desktop on mobile */}
                    {!bgMobileUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Overlay for readability */}
                    <div
                        className="absolute inset-0 bg-black/35"
                        aria-hidden="true"
                    />
                </>
            )}

            <div className="v-sec__container relative z-10">
                <header
                    className="v-head v-head--center"
                    data-v="pricing-head"
                >
                    {eyebrow && (
                        <div className="v-kicker--light">{eyebrow}</div>
                    )}
                    <h2 className="v-title-xl text-[#ebe8e8]">{title}</h2>
                    {subtitle && (
                        <p className="v-sub--light">{subtitle}</p>
                    )}
                    {contentHtml ? <SectionHTML html={contentHtml} /> : null}
                </header>

                <div
                    className="v-pricing grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    data-v="pricing-grid"
                >
                    {items.map((pkg, idx) => (
                        <article
                            key={pkg.id || idx}
                            data-v={`price-${idx}`}
                            className="v-price rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm p-5 grid grid-rows-[auto_1fr_auto] min-h-[400px]"
                        >
                            {/* Title left, price right, aligned on baseline */}
                            <header className="v-price__head flex items-baseline justify-between gap-4">
                                <h3 className="v-price__title text-sm md:text-base font-semibold leading-tight">
                                    {pkg.title}
                                </h3>

                                {(pkg.price || pkg.per) && (
                                    <div className="v-price__value flex items-baseline gap-1">
                                        {pkg.price ? (
                                            <span className="v-price__amount !text-lg md:!text-xl font-semibold tracking-tight leading-none">
                                                {pkg.price}
                                            </span>
                                        ) : null}
                                        {pkg.per ? (
                                            <span className="v-price__per !text-[10px] md:!text-xs opacity-80 leading-none">
                                                {pkg.per}
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                            </header>

                            <div className="v-hr--dark my-4 h-px bg-white/10 rounded-3xl" />

                            {/* Features fill the middle; keeps CTAs at bottom */}
                            <div className="v-price__list text-xs md:text-sm leading-relaxed">
                                {pkg.featuresHtml ? (
                                    <CardHTML html={pkg.featuresHtml} />
                                ) : (
                                    <div className="v-li">
                                        Details will be provided.
                                    </div>
                                )}
                            </div>

                            {/* CTAs side-by-side (wrap on very small screens) */}
                            <div className="mt-5 flex flex-wrap gap-3 justify-center">
                                {pkg.ctas?.length ? (
                                    pkg.ctas.map((c, i) =>
                                        c?.url ? (
                                            <Link
                                                key={i}
                                                href={c.url}
                                                target={c.target ?? "_self"}
                                                className="btn-brand px-3 py-2 text-xs md:text-sm"
                                                aria-label={`${pkg.title} — ${
                                                    c.title ?? "Select"
                                                }`}
                                            >
                                                {c.title ?? "Select"}
                                            </Link>
                                        ) : null
                                    )
                                ) : (
                                    <span
                                        className="btn-brand px-3 py-2 text-xs md:text-sm"
                                        aria-disabled="true"
                                    >
                                        Select plan
                                    </span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>

                {/* Section-level CTA (optional) */}
                {sectionCta?.href ? (
                    <div className="mt-10 text-center">
                        <Link
                            href={sectionCta.href}
                            target={sectionCta.target ?? "_self"}
                            className="btn-outline bg-white rounded-3xl text-sm md:text-base px-4 py-2"
                        >
                            {sectionCta.label ?? "Compare packages"}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
