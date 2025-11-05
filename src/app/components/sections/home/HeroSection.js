// /src/components/sections/home/HeroSection.jsx
"use client";

import Link from "next/link";

/**
 * Reusable Hero section with Electric FX background and responsive image sources.
 */

export default function HeroSection({
                                        bgUrl,
                                        bgMobileUrl,
                                        kicker = "AI Driven Growth",
                                        title = "Build the Future of Your Business",
                                        subtitle = "Headless web, AI systems, and automated marketing.",
                                        primaryHref = "/contact",
                                        primaryLabel = "Get Started",
                                        secondaryHref = "#pricing",
                                        secondaryLabel = "See Pricing",
                                    }) {
    return (
        <section id="hero" className="v-hero bg-fixed" aria-label="Hero">
            {/* Background layer (image + radial) */}
            <div className="v-hero__bg">
                {bgMobileUrl || bgUrl ? (
                    <picture>
                        {bgMobileUrl && <source media="(max-width: 640px)" srcSet={bgMobileUrl} />}
                        <img src={bgUrl || bgMobileUrl} alt="" className="v-hero__img" loading="eager" />
                    </picture>
                ) : (
                    <div className="v-hero__placeholder" />
                )}
                <div className="v-hero__radial" />
            </div>

            {/* Electric FX (grid, shapes, scanlines) */}
            <div className="fx-electric pointer-events-none absolute inset-0 -z-10">
                <div className="grid-bg fx-layer" />
                <div className="shapes-container fx-layer">
                    <div className="shape shape-circle" />
                    <div className="shape shape-triangle" />
                    <div className="shape shape-square" />
                </div>
                <div className="scanlines fx-layer" />
            </div>

            {/* Content */}
            <div className="v-hero__content">
                {kicker ? <p className="text-sm text-white">{kicker}</p> : null}
                {title ? (
                    <h1 className="text-white mt-2 text-4xl md:text-5xl font-extrabold tracking-[-0.02em]">
                        {title}
                    </h1>
                ) : null}
                {subtitle ? <h2 className="mt-4 text-lg text-white">{subtitle}</h2> : null}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {primaryHref && primaryLabel ? (
                        <Link href={primaryHref} className="btn-brand" aria-label={primaryLabel}>
                            {primaryLabel}
                        </Link>
                    ) : null}
                    {secondaryHref && secondaryLabel ? (
                        <Link href={secondaryHref} className="btn-brand-outline" aria-label={secondaryLabel}>
                            {secondaryLabel}
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
