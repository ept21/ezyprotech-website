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
            className="prose prose-invert max-w-2xl mx-auto mt-4 text-slate-100/90"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    // Normalize CTAs with fallbacks
    const primaryHref = primaryCta?.url || "/contact";
    const primaryLabel = primaryCta?.title || "Send a message";
    const primaryTarget = primaryCta?.target || "_self";

    const secondaryHref = secondaryCta?.url || "#contact";
    const secondaryLabel = secondaryCta?.title || "Contact us";
    const secondaryTarget = secondaryCta?.target || "_self";

    return (
        <section
            id="ctasection"
            data-v="cta"
            className="
        relative overflow-hidden
        v-sec v-sec--scheme-1
        text-center
      "
            role="region"
            aria-label="Final call to action"
        >
            {/* Background from CMS: desktop + mobile */}
            {bgUrl || mobileBgUrl ? (
                <>
                    {/* Desktop background with fixed attachment (no mobile fixed) */}
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat bg-fixed"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Mobile background (scroll) */}
                    {mobileBgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${mobileBgUrl})` }}
                        />
                    )}

                    {/* Fallback – use desktop bg on mobile if no mobile image */}
                    {!mobileBgUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Dark / neon overlay for readability, like the mockup */}
                    <div
                        aria-hidden="true"
                        className="
              absolute inset-0
              bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.35),_rgba(15,23,42,0.85))]
            "
                    />
                    <div
                        aria-hidden="true"
                        className="
              pointer-events-none absolute inset-0
              bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.35),transparent_60%)]
              mix-blend-screen opacity-80
            "
                    />
                </>
            ) : (
                // Default gradient if no image at all
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0b1120,_#020617)]"
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                <div
                    className="
            v-sec__container
            flex flex-col items-center justify-center
            min-h-[460px] md:min-h-[540px] lg:min-h-[620px]
            py-16 md:py-24
          "
                >
                    <header className="max-w-4xl mx-auto">
                        {eyebrow && (
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                                {eyebrow}
                            </p>
                        )}

                        <h2
                            className="
                text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem]
                font-semibold md:font-bold
                leading-tight md:leading-snug
                tracking-[-0.04em]
                text-white
              "
                        >
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-slate-100/85 max-w-3xl mx-auto">
                                {subtitle}
                            </p>
                        )}

                        {contentHtml ? <HTML html={contentHtml} /> : null}
                    </header>

                    {/* CTA buttons – same row, responsive */}
                    <div
                        className="
              mt-[-40px]
              flex flex-wrap items-center justify-center
              gap-4 sm:gap-5
            "
                    >
                        {/* Primary button – neon gradient pill */}
                        <Link
                            href={primaryHref}
                            target={primaryTarget}
                            className="
                inline-flex items-center justify-center
                rounded-full
                px-4 sm:px-4 md:px-4
                py-3.5 sm:py-4
                text-sm sm:text-base md:text-lg
                font-semibold tracking-tight
                text-slate-900
                bg-[linear-gradient(90deg,#00C293,#00C2FF)]
                shadow-[0_10px_23px_rgba(0,194,255,0.55)]
                border border-white/50
                transition-all duration-200
                hover:shadow-[0_12px_30px_rgba(0,194,255,0.8)]
                hover:-translate-y-[1px]
              "
                        >
                            {primaryLabel}
                        </Link>

                        {/* Secondary button – glass outline pill */}
                        <Link
                            href={secondaryHref}
                            target={secondaryTarget}
                            className="
                inline-flex items-center justify-center
                rounded-full
                px-4 sm:px-4 md:px-4
                py-3.5 sm:py-4
                text-sm sm:text-base md:text-lg
                font-semibold tracking-tight
                text-cyan-100
                border border-cyan-200/70
                bg-white/5
                backdrop-blur-xl
                shadow-[0_8px_10px_rgba(15,23,42,0.7)]
                transition-all duration-200
                hover:bg-white/10
                hover:shadow-[0_8px_26px_rgba(15,23,42,0.95)]
                hover:-translate-y-[1px]
              "
                        >
                            {secondaryLabel}
                        </Link>
                    </div>

                    {/* Optional wide image below (kept for backwards compatibility) */}
                    {imageUrl && (
                        <img
                            className="v-img-wide mt-10 max-w-5xl mx-auto"
                            src={imageUrl}
                            alt=""
                            loading="lazy"
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
