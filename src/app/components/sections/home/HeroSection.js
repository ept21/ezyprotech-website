// /src/components/sections/home/HeroSection.jsx
"use client";

import clsx from "clsx";

/**
 * NOTE: All comments must remain in English only.
 * Props:
 * - bgUrl, bgMobileUrl: string | null
 * - videoUrl, videoUrlMobile: string | null
 * - kicker, title, subtitle: strings
 * - contentHtml: string (WYSIWYG HTML; optional)
 * - primaryHref/Label, secondaryHref/Label
 */
export default function HeroSection({
                                        bgUrl = null,
                                        bgMobileUrl = null,
                                        videoUrl = null,
                                        videoUrlMobile = null,
                                        kicker = "AI Driven Growth",
                                        title = "Build the Future of Your Business",
                                        subtitle = "Headless web, AI systems, and automated marketing.",
                                        contentHtml = "",
                                        primaryHref = "/contact",
                                        primaryLabel = "Get Started",
                                        secondaryHref = "#pricing",
                                        secondaryLabel = "See Pricing",
                                    }) {
    const hasVideo = !!(videoUrl || videoUrlMobile);
    const hasImage = !!(bgUrl || bgMobileUrl);

    return (
        <section className="v-hero" aria-label="Hero">
            <div className="v-hero__bg">
                {/* Prefer video if provided; mobile source first */}
                {hasVideo ? (
                    <video
                        className="v-hero__img"
                        playsInline
                        autoPlay
                        muted
                        loop
                        poster={bgUrl || bgMobileUrl || undefined}
                    >
                        {videoUrlMobile ? <source src={videoUrlMobile} media="(max-width: 640px)" /> : null}
                        {videoUrl ? <source src={videoUrl} /> : null}
                    </video>
                ) : hasImage ? (
                    <picture>
                        {bgMobileUrl && <source media="(max-width: 640px)" srcSet={bgMobileUrl} />}
                        <img src={bgUrl || bgMobileUrl} alt="" className="v-hero__img" loading="eager" />
                    </picture>
                ) : (
                    <div className="v-hero__placeholder" />
                )}
                <div className="v-hero__radial" />
            </div>

            {/* Electric FX layer (unchanged) */}
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
                <h1 className="text-white mt-2 text-4xl md:text-5xl font-extrabold tracking-[-0.02em]">
                    {title}
                </h1>
                {subtitle ? <p className="mt-4 text-lg text-white">{subtitle}</p> : null}

                {/* Optional WYSIWYG content */}
                {contentHtml ? (
                    <div
                        className="mt-4 text-white/90 max-w-3xl mx-auto prose prose-invert prose-p:my-2"
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                ) : null}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    {primaryHref && primaryLabel ? (
                        <a href={primaryHref} className="btn-brand">{primaryLabel}</a>
                    ) : null}
                    {secondaryHref && secondaryLabel ? (
                        <a href={secondaryHref} className="btn-brand-outline text-white">{secondaryLabel}</a>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
