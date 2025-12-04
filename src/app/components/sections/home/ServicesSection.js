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

    // Expose background URLs as CSS custom properties.
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

    // Core observer logic (center active card)
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
                "relative overflow-hidden",
                "bg-fixed"
            )}
            style={sectionStyle}
            role="region"
            aria-label="Services carousel"
        >
            {/* Overlay on top of the CMS background: light, futuristic */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none "
                style={{
                    background: hasBackground
                        ? "radial-gradient(130% 85% at 0% 0%, rgba(255,255,255,0.18), transparent), radial-gradient(140% 90% at 100% 100%, rgba(56,189,248,0.26), transparent)"
                        : "linear-gradient(135deg,#f5f7fb 0%,#e3f3ff 40%,#f3fbff 100%)",
                }}
            />

            <div className="v-sec__container relative">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? (
                        <div className="v-kicker v-kicker--dark">{eyebrow}</div>
                    ) : null}
                    <h2 className="v-h2 mt-2 text-[#0B1220]">{title}</h2>
                    {subtitle ? (
                        <p className="v-subtitle mt-3 text-[#253047]">{subtitle}</p>
                    ) : null}
                    {contentHtml ? (
                        <div
                            className="v-copy mt-6 text-[#253047]"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    ) : null}
                </div>

                {/* Carousel */}
                <div className="v-sec__body mt-4 md:mt-6 w-full">
                    <div className="relative overflow-visible">
                        <div
                            ref={trackRef}
                            className={cx(
                                "flex overflow-x-auto relative",
                                "py-4 md:py-5",
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

                                    const outerClasses = cx(
                                        "relative snap-center",
                                        widthClasses,
                                        "rounded-[30px] p-[1px] overflow-hidden",
                                        "bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.65),_rgba(15,23,42,0.45))]",
                                        "transition-transform transition-shadow duration-300 ease-out",
                                        isCurrentActive
                                            ? "scale-[1.03] shadow-[0_0_10px_rgba(45,212,191,0.9)]"
                                            : "scale-[0.99] opacity-95 shadow-[0_0_10px_rgba(15,23,42,0.35)] hover:scale-[1.01] hover:opacity-100"
                                    );

                                    return (
                                        <article
                                            key={card?.id ?? idx}
                                            data-index={idx}
                                            ref={(el) => (cardRefs.current[idx] = el)}
                                            className={outerClasses}
                                            tabIndex={0}
                                        >
                                            {/* Inner glass card */}
                                            <div
                                                className={cx(
                                                    "relative flex h-full flex-col rounded-[28px] overflow-hidden",
                                                    "bg-white/8 backdrop-blur-xl",
                                                    "border border-white/60"
                                                )}
                                            >
                                                {/* Card background image */}
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
                                                        {/* Light glass overlay */}
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{
                                                                background:
                                                                    "linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.40))",
                                                            }}
                                                        />
                                                        {/* Subtle diagonal highlight */}
                                                        <div
                                                            className="absolute -left-1/3 -top-1/4 w-2/3 h-2/3 rotate-[18deg]"
                                                            style={{
                                                                background:
                                                                    "linear-gradient(120deg,rgba(255,255,255,0.65),transparent)",
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Content */}
                                                <div className="relative z-10 flex h-full flex-col justify-between px-6 py-6 md:px-8 md:py-7 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        {/* Kicker pill */}
                                                        {card?.kicker && (
                                                            <div
                                                                className={cx(
                                                                    "inline-flex items-center justify-center rounded-full",
                                                                    "px-4 py-1 text-[11px] tracking-[0.16em] uppercase font-semibold",
                                                                    "bg-white/80 text-[#0A84FF] shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                                                                )}
                                                            >
                                                                {card.kicker}
                                                            </div>
                                                        )}

                                                        {/* Title */}
                                                        <h3
                                                            className={cx(
                                                                "font-heading font-semibold",
                                                                "text-[22px] md:text-[24px] leading-snug",
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

                                                        {/* Excerpt */}
                                                        {card?.excerpt && (
                                                            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#253047] line-clamp-3">
                                                                {stripTags(card.excerpt)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* CTAs row */}
                                                    <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
                                                        {/* 1. Explore -> category page */}
                                                        <Link
                                                            href={card?.href || "#"}
                                                            className={cx(
                                                                "inline-flex items-center justify-center",
                                                                "rounded-full px-5 py-2",
                                                                "text-[13px] md:text-[14px] font-semibold",
                                                                "bg-gradient-to-r from-[#008D7F] via-[#00C293] to-[#00C5FF]",
                                                                "text-white shadow-[0_0_22px_rgba(0,197,255,0.65)]",
                                                                "transition-transform transition-shadow duration-200 ease-out",
                                                                "hover:-translate-y-[1px] hover:shadow-[0_0_30px_rgba(0,197,255,0.85)]"
                                                            )}
                                                        >
                                                            Explore
                                                        </Link>

                                                        {/* 2. Book a strategy call -> /contact */}
                                                        <Link
                                                            href="/contact"
                                                            className={cx(
                                                                "inline-flex items-center gap-2",
                                                                "text-[13px] md:text-[14px] font-medium",
                                                                "text-[#0B1220]",
                                                                "px-4 py-2 rounded-full",
                                                                "border border-[rgba(10,132,255,0.35)]",
                                                                "bg-white/80 hover:bg-white",
                                                                "shadow-[0_0_16px_rgba(10,132,255,0.25)]",
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
                                    width="18"
                                    height="18"
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
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="min-w-full text-center py-12 border border-dashed rounded-2xl opacity-70 bg-white/40 backdrop-blur-md">
                                    <p className="v-subline text-[#253047]">No services available.</p>
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
                                        "rounded-full bg-white/70 hover:bg-white border border-white/80",
                                        "backdrop-blur-md text-[#0B1220] pointer-events-auto transition",
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
                                        "rounded-full bg-white/70 hover:bg-white border border-white/80",
                                        "backdrop-blur-md text-[#0B1220] pointer-events-auto transition",
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
                                            ? "w-7 bg-[var(--brand-primary)] scale-110"
                                            : "w-3 bg-[#d5dde8] hover:bg-[rgba(10,132,255,0.70)] hover:scale-105"
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
