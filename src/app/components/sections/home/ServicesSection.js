// /src/app/components/sections/home/ServicesSection.js
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const cx = (...cls) => cls.filter(Boolean).join(" ");
const stripTags = (html) =>
    !html ? "" : String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/** NOTE: All comments must remain in English only. */
export default function ServicesSection({
                                            eyebrow = "Accelerate",
                                            title = "Our core services",
                                            subtitle = "Innovative solutions designed to drive your business forward with precision and intelligence.",
                                            contentHtml = "",
                                            bgUrl = null,
                                            bgMobileUrl = null,
                                            mobileBackgroundImage = null,
                                            items = [],
                                            sectionCta = { href: "/services", label: "View all services", target: null },
                                        }) {
    const hasItems = Array.isArray(items) && items.length > 0;

    const trackRef = useRef(null);
    const [active, setActive] = useState(0);
    const isScrollingByJSRef = useRef(false);

    const cardRefs = useRef([]);
    const observerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Resolve mobile background from CMS
    const resolvedMobileBgUrl = bgMobileUrl || mobileBackgroundImage || null;
    const hasBackground = !!(bgUrl || resolvedMobileBgUrl);

    // Expose CMS background images as CSS custom properties
    const sectionStyle = hasBackground
        ? {
            "--v-services-bg-desktop": bgUrl ? `url('${bgUrl}')` : "none",
            "--v-services-bg-mobile": resolvedMobileBgUrl
                ? `url('${resolvedMobileBgUrl}')`
                : bgUrl
                    ? `url('${bgUrl}')`
                    : "none",
        }
        : undefined;

    // Section overlay: keep image visible but add contrast for content
    const sectionOverlayStyle = hasBackground
        ? {
            background:
                "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.78), transparent 55%), radial-gradient(120% 140% at 50% 100%, rgba(15,23,42,0.45), transparent 60%)",
        }
        : {
            background:
                "linear-gradient(135deg, #f5f7fa 0%, #e4ebf5 40%, #d7e2f1 100%)",
        };

    // IntersectionObserver logic
    const initializeObserver = useCallback(() => {
        if (cardRefs.current.length === 0 || !trackRef.current) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerCallback = (entries) => {
            if (isScrollingByJSRef.current) return;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            const mostVisible = entries.find(
                (entry) => entry.intersectionRatio >= 0.75
            );

            if (mostVisible) {
                const index = Number(mostVisible.target.dataset.index);
                timeoutRef.current = setTimeout(() => {
                    setActive(index);
                }, 50);
            }
        };

        const observer = new IntersectionObserver(observerCallback, {
            root: trackRef.current,
            rootMargin: "0px",
            threshold: [0.3, 0.5, 0.75],
        });

        observerRef.current = observer;

        cardRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });
    }, []);

    useEffect(() => {
        if (!hasItems) return;
        initializeObserver();
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [hasItems, items.length, initializeObserver]);

    const scrollToIndex = (i) => {
        const el = trackRef.current;
        const target = cardRefs.current[i];
        if (!el || !target) return;

        isScrollingByJSRef.current = true;
        const offset =
            target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2;
        el.scrollTo({ left: offset, behavior: "smooth" });
        setActive(i);

        setTimeout(() => {
            isScrollingByJSRef.current = false;
        }, 400);
    };

    const prev = () => scrollToIndex(Math.max(0, active - 1));
    const next = () => scrollToIndex(Math.min(items.length - 1, active + 1));

    return (
        <section
            id="services"
            className={cx(
                "v-sec",
                "v-sec--scheme-2",
                "v-sec--carousel",
                "relative",
                "overflow-hidden"
            )}
            style={sectionStyle}
            role="region"
            aria-label="Services carousel"
        >
            {/* Overlay above section background image */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none"
                style={sectionOverlayStyle}
            />

            <div className="v-sec__container relative">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? (
                        <div className="v-eyebrow v-kicker--dark">{eyebrow}</div>
                    ) : null}
                    <h2 className="v-h2 mt-2 text-[#0B1220]">{title}</h2>
                    {subtitle ? (
                        <p className="v-subtitle mt-3 text-[#1f2933]">{subtitle}</p>
                    ) : null}
                    {contentHtml ? (
                        <div
                            className="v-copy mt-6 text-[#1f2933]"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    ) : null}
                </div>

                {/* Carousel */}
                <div className="v-sec__body mt-3 md:mt-4 w-full">
                    <div className="relative overflow-visible">
                        <div
                            ref={trackRef}
                            className={cx(
                                "flex overflow-x-auto relative",
                                "py-3 md:py-4",
                                "gap-6 md:gap-8",
                                "snap-x snap-mandatory",
                                "scroll-pl-[5vw] pr-[5vw] md:scroll-pl-0 md:pr-0",
                                "no-scrollbar cursor-grab active:cursor-grabbing",
                                "px-4 md:px-0"
                            )}
                            style={{
                                scrollBehavior: "smooth",
                                overscrollBehaviorX: "contain",
                                WebkitOverflowScrolling: "touch",
                            }}
                        >
                            {hasItems ? (
                                items.map((card, idx) => {
                                    const isCurrentActive = idx === active;

                                    const widthClasses = cx(
                                        "flex-none",
                                        "w-[88vw]",
                                        "md:w-[calc(33.333%-16px)]",
                                        "lg:w-[calc(33.333%-20px)]",
                                        "xl:w-[calc(33.333%-20px)]"
                                    );

                                    const outerCardClasses = cx(
                                        "relative snap-center",
                                        widthClasses,
                                        "rounded-[26px] p-[1px]",
                                        "bg-[radial-gradient(circle_at_top,_rgba(10,132,255,0.45),_rgba(0,194,255,0.22))]",
                                        isCurrentActive
                                            ? "shadow-[0_0_10px_rgba(10,132,255,0.32)] scale-[1.03]"
                                            : "shadow-[0_7px_10px_rgba(15,23,42,0.18)]",
                                        "transition-all duration-300 ease-out will-change-transform",
                                        "hover:scale-[1.035]"
                                    );

                                    const innerCardClasses = cx(
                                        "relative h-full overflow-hidden",
                                        "rounded-[24px]",
                                        "bg-white/60 backdrop-blur-2xl",
                                        "border border-white/80",
                                        "flex flex-col"
                                    );

                                    return (
                                        <article
                                            key={card?.id ?? idx}
                                            data-index={idx}
                                            ref={(el) => (cardRefs.current[idx] = el)}
                                            className={outerCardClasses}
                                            tabIndex={0}
                                        >
                                            <div className={innerCardClasses}>
                                                {/* Card highlight overlay for glassy feel */}
                                                <div
                                                    aria-hidden
                                                    className="pointer-events-none absolute inset-0 rounded-[24px]"
                                                    style={{
                                                        background:
                                                            "linear-gradient(140deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.55) 26%, rgba(255,255,255,0.24) 55%, rgba(255,255,255,0.08) 100%)",
                                                        mixBlendMode: "screen",
                                                    }}
                                                />

                                                {/* Media background */}
                                                {card?.image && (
                                                    <div className="absolute inset-0 -z-10 pointer-events-none">
                                                        <Image
                                                            src={card.image}
                                                            alt={card?.title || "Service image"}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(min-width: 1024px) 33vw, 88vw"
                                                            priority={idx < 3}
                                                        />
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                // Softer overlay so the image is clearly visible
                                                                background:
                                                                    "radial-gradient(circle at 15% 0%, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.35) 32%, transparent 60%), linear-gradient(170deg, rgba(248,250,252,0.45) 0%, rgba(241,245,249,0.75) 45%, rgba(226,232,240,0.9) 100%)",
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div
                                                    className={cx(
                                                        "relative z-10 flex-1",
                                                        isCurrentActive ? "p-6 md:p-7" : "p-5 md:p-6"
                                                    )}
                                                >
                                                    <div className="min-h-[320px] md:min-h-[340px] flex flex-col items-center justify-center text-center gap-4">
                                                        <div className="flex flex-col gap-2 items-center text-center">
                                                            {card?.kicker ? (
                                                                <div className="inline-flex items-center rounded-full border border-[rgba(10,132,255,0.22)] bg-white/70 px-3 py-1 shadow-[0_6px_18px_rgba(15,23,42,0.16)]">
                                                                    <span className="text-[11px] tracking-[0.18em] uppercase text-[#0A84FF] font-semibold">
                                                                        {card.kicker}
                                                                    </span>
                                                                </div>
                                                            ) : null}

                                                            <h3
                                                                className={cx(
                                                                    "font-heading font-bold",
                                                                    isCurrentActive
                                                                        ? "text-[24px] md:text-[28px] leading-tight"
                                                                        : "text-[22px] leading-snug",
                                                                    "text-[#0B1220]"
                                                                )}
                                                            >
                                                                <Link
                                                                    href={card?.href || "#"}
                                                                    className="no-underline hover:underline decoration-[var(--brand-primary)]"
                                                                >
                                                                    {card?.title || "Untitled service"}
                                                                </Link>
                                                            </h3>

                                                            {card?.excerpt ? (
                                                                <p
                                                                    className={cx(
                                                                        "text-[14px] md:text-[15px] leading-relaxed",
                                                                        "text-[#243b53]",
                                                                        "line-clamp-3"
                                                                    )}
                                                                >
                                                                    {stripTags(card.excerpt)}
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        {/* CTAs row */}
                                                        <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
                                                            {/* 1. Explore -> category page */}
                                                            <Link
                                                                href={card?.href || "#"}
                                                                className={cx(
                                                                    "inline-flex items-center justify-center",
                                                                    "rounded-full px-4 py-2",
                                                                    "text-sm font-semibold",
                                                                    "bg-gradient-to-r from-[#008D7F] to-[#00C5FF]",
                                                                    "text-white",
                                                                    "shadow-[0_0_20px_rgba(0,197,255,0.8)]",
                                                                    "transition-transform transition-shadow duration-200 ease-out",
                                                                    "hover:-translate-y-[1px] hover:shadow-[0_0_30px_rgba(0,197,255,0.95)]"
                                                                )}
                                                            >
                                                                Explore
                                                            </Link>

                                                            {/* 2. Book a strategy call -> /contact */}
                                                            <Link
                                                                href="/contact"
                                                                className={cx(
                                                                    "inline-flex items-center gap-2",
                                                                    "text-sm font-medium",
                                                                    "text-[#0B1220]",
                                                                    "px-3 py-1.5 rounded-full",
                                                                    "border border-[rgba(10,132,255,0.3)]",
                                                                    "bg-white/75 hover:bg-white",
                                                                    "shadow-[0_0_14px_rgba(10,132,255,0.2)]",
                                                                    "transition-colors transition-shadow duration-200 ease-out"
                                                                )}
                                                                aria-label="Book a strategy call"
                                                            >
                                                                Book a strategy call
                                                                <span
                                                                    aria-hidden
                                                                    className="inline-block translate-y-[1px]"
                                                                >
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                    >
                                                                        <path
                                                                            d="M9 6l6 6-6 6"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        />
                                                                    </svg>
                                                                </span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="min-w-full text-center py-12 border border-dashed rounded-2xl opacity-70">
                                    <p className="v-subline text-[#243b53]">
                                        No services available.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Arrows */}
                        {hasItems && (
                            <>
                                <button
                                    type="button"
                                    onClick={prev}
                                    disabled={active === 0}
                                    aria-label="Previous"
                                    className={cx(
                                        "absolute left-2 md:left-[-16px] top-1/2 -translate-y-1/2 z-[999]",
                                        "w-10 h-10 flex items-center justify-center",
                                        "rounded-full bg-white/80 hover:bg-white border border-[rgba(148,163,184,0.7)]",
                                        "backdrop-blur-sm text-[#0B1220] pointer-events-auto transition",
                                        active === 0 && "opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M15 6l-6 6 6 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={next}
                                    disabled={active === items.length - 1}
                                    aria-label="Next"
                                    className={cx(
                                        "absolute right-2 md:right-[-16px] top-1/2 -translate-y-1/2 z-[999]",
                                        "w-10 h-10 flex items-center justify-center",
                                        "rounded-full bg-white/80 hover:bg-white border border-[rgba(148,163,184,0.7)]",
                                        "backdrop-blur-sm text-[#0B1220] pointer-events-auto transition",
                                        active === items.length - 1 && "opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 6l6 6-6 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Dots */}
                    {hasItems && (
                        <div className="mt-6 flex justify-center gap-2">
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    aria-current={i === active ? "true" : "false"}
                                    className={cx(
                                        "h-2 rounded-full transition-all duration-200 transform",
                                        i === active
                                            ? "w-6 bg-[var(--brand-primary)] scale-110"
                                            : "w-3 bg-[#d0d7e2] hover:bg-[rgba(10,132,255,0.70)] hover:scale-105"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Section CTA */}
                <div className="v-actions mt-10 text-center">
                    <Link
                        href={sectionCta?.href || "/services"}
                        target={sectionCta?.target || undefined}
                        className="btn-brand"
                        aria-label={sectionCta?.label || "View all services"}
                    >
                        {sectionCta?.label || "View all services"}
                    </Link>
                </div>
            </div>
        </section>
    );
}
