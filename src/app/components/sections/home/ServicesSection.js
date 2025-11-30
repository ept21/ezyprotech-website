// /src/app/components/sections/home/ServicesSection.js
"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

const cx = (...cls) => cls.filter(Boolean).join(" ");
const stripTags = (html) =>
    !html ? "" : String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

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
    // Flag to control observer suppression during JS scrolling
    const isScrollingByJSRef = useRef(false);

    const cardRefs = useRef([]);
    const observerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Resolve mobile background URL from either prop name
    const resolvedMobileBgUrl = bgMobileUrl || mobileBackgroundImage || null;
    const hasBackground = !!(bgUrl || resolvedMobileBgUrl);

    // --- Core Observer Logic ---
    const initializeObserver = useCallback(() => {
        if (cardRefs.current.length === 0 || !trackRef.current) return;

        // Disconnect old observer if exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerCallback = (entries) => {
            // Use ref flag to ignore events triggered by programmatic scrolling
            if (isScrollingByJSRef.current) return;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Find the most visible card (>= 75% visible for center snap)
            const mostVisible = entries.find((entry) => entry.intersectionRatio >= 0.75);

            if (mostVisible) {
                const index = Number(mostVisible.target.dataset.index);

                // Debounce setting state to wait for scroll to settle
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
        // We only depend on items length; other deps are handled via refs
    }, [hasItems, items.length]);

    // Effect to manage observer lifecycle and connection status
    useEffect(() => {
        if (!hasItems) return;

        initializeObserver();

        // Cleanup on unmount or re-initialization
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [hasItems, items.length, initializeObserver]);

    // Navigation function (used by buttons and dots)
    const scrollToIndex = (i) => {
        const el = trackRef.current;
        const target = cardRefs.current[i];
        if (!el || !target) return;

        // Set ref flag to ignore observer events
        isScrollingByJSRef.current = true;

        // Calculate the scroll position needed to center the target element
        const offset = target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2;

        el.scrollTo({ left: offset, behavior: "smooth" });
        setActive(i);

        // Reset flag after scroll duration (re-enables the observer)
        setTimeout(() => {
            isScrollingByJSRef.current = false;
        }, 400);
    };

    const prev = () => scrollToIndex(Math.max(0, active - 1));
    const next = () => scrollToIndex(Math.min(items.length - 1, active + 1));

    // Wide index is now purely for visual effect (opacity/ring), not width calculation
    const wideIndex = useMemo(() => {
        return items?.length ? active : 0;
    }, [active, items?.length]);

    return (
        <section
            id="services"
            className={cx("v-sec", "v-sec--scheme-2", "v-sec--carousel", "relative")}
            role="region"
            aria-label="Services carousel"
        >
            {/* Responsive background image, similar to HeroSection */}
            {hasBackground && (
                <div
                    aria-hidden
                    className="absolute inset-0 -z-20 pointer-events-none"
                >
                    <picture>
                        {resolvedMobileBgUrl && (
                            <source
                                media="(max-width: 640px)"
                                srcSet={resolvedMobileBgUrl}
                            />
                        )}
                        <img
                            src={bgUrl || resolvedMobileBgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </picture>
                </div>
            )}

            {/* Dark overlay gradient */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none"
            />

            <div className="v-sec__container relative overflow-visible">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? <div className="v-eyebrow v-kicker--light">{eyebrow}</div> : null}
                    <h2 className="v-h2 mt-2 text-white">{title}</h2>
                    {subtitle ? (
                        <p className="v-subtitle mt-3 text-white/90">{subtitle}</p>
                    ) : null}
                    {contentHtml ? (
                        <div
                            className="v-copy mt-6 text-white/90"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    ) : null}
                </div>

                {/* Carousel */}
                <div className="v-sec__body mt-10 w-full">
                    <div className="relative overflow-visible">
                        <div
                            ref={trackRef}
                            className={cx(
                                "flex overflow-x-auto pb-4 relative",
                                "gap-6 md:gap-8",
                                "snap-x snap-mandatory",
                                "scroll-pl-[5vw] pr-[5vw] md:scroll-pl-0 md:pr-0",
                                "no-scrollbar cursor-grab active:cursor-grabbing",
                                "px-0 md:px-0"
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
                                        "w-[90vw]", // Mobile: single card
                                        "md:w-[calc(33.333%-16px)]",
                                        "lg:w-[calc(33.333%-20px)]",
                                        "xl:w-[calc(33.333%-20px)]"
                                    );

                                    return (
                                        <article
                                            key={card?.id ?? idx}
                                            data-index={idx}
                                            ref={(el) => (cardRefs.current[idx] = el)}
                                            className={cx(
                                                "v-card v-card--overlay",
                                                "snap-center rounded-2xl overflow-hidden",
                                                widthClasses,
                                                "transition-all duration-300 ease-out",
                                                isCurrentActive
                                                    ? "opacity-100 ring-2 ring-white/70 shadow-2xl"
                                                    : "opacity-70 ring-1 ring-transparent"
                                            )}
                                        >
                                            {/* media */}
                                            <div className="relative w-full pointer-events-none">
                                                <div
                                                    className={
                                                        isCurrentActive ? "h-[335px]" : "h-[339px]"
                                                    }
                                                />
                                                {card?.image ? (
                                                    <Image
                                                        src={card.image}
                                                        alt={card?.title || "Service image"}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(min-width: 1024px) 33vw, 90vw"
                                                        priority={idx < 3}
                                                    />
                                                ) : null}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background:
                                                            "linear-gradient(0deg, rgba(0,0,0,.40), rgba(0,0,0,.40))",
                                                    }}
                                                />
                                            </div>

                                            {/* content */}
                                            <div
                                                className={cx(
                                                    "absolute inset-0",
                                                    isCurrentActive ? "p-6 md:p-12" : "p-6"
                                                )}
                                            >
                                                <div className="h-full flex flex-col justify-between pointer-events-auto">
                                                    <div className="flex flex-col gap-2">
                                                        {card?.kicker ? (
                                                            <div className="v-kicker text-white">
                                                                {card.kicker}
                                                            </div>
                                                        ) : null}
                                                        <h3
                                                            className={cx(
                                                                isCurrentActive
                                                                    ? "text-4xl lg:text-[48px] leading-tight font-bold"
                                                                    : "v-h4",
                                                                "text-white"
                                                            )}
                                                        >
                                                            <Link
                                                                href={card?.href || "#"}
                                                                className="v-link-reset"
                                                            >
                                                                {card?.title || "Untitled service"}
                                                            </Link>
                                                        </h3>
                                                        {card?.excerpt ? (
                                                            <p
                                                                className={cx(
                                                                    isCurrentActive
                                                                        ? "text-lg leading-[27px]"
                                                                        : "v-body",
                                                                    "text-white/90"
                                                                )}
                                                            >
                                                                {stripTags(card.excerpt)}
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-6">
                                                        <Link
                                                            href={card?.href || "#"}
                                                            className="rounded-full px-3 py-1.5 border-2 border-white text-white text-[18px] leading-[27px] font-medium hover:bg-white/10 transition"
                                                        >
                                                            Explore
                                                        </Link>
                                                        <Link
                                                            href={card?.cta?.url || card?.href || "#"}
                                                            target={card?.cta?.target || undefined}
                                                            className="flex items-center gap-2 text-white text-[18px] leading-[27px] font-medium hover:text-brand-accent transition"
                                                            aria-label={card?.cta?.title || "Learn"}
                                                        >
                                                            {card?.cta?.title || "Learn"}
                                                            <span
                                                                aria-hidden
                                                                className="inline-block translate-y-[1px]"
                                                            >
                                                                <svg
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M9 6l6 6-6 6"
                                                                        stroke="white"
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
                                <div className="min-w-full text-center py-12 border border-dashed rounded-2xl opacity-70">
                                    <p className="v-subline text-white">
                                        No services available. Add services in WordPress.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* arrows */}
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
                                        "rounded-full bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto transition",
                                        active === 0 && "opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
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
                                        "rounded-full bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto transition",
                                        active === items.length - 1 &&
                                        "opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    <svg
                                        width="24"
                                        height="24"
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
                                </button>
                            </>
                        )}
                    </div>

                    {/* dots */}
                    {hasItems && (
                        <div className="mt-6 flex justify-center gap-2">
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    aria-current={i === active ? "true" : "false"}
                                    className={cx(
                                        "h-2 rounded-full transition-all",
                                        i === active ? "w-6 bg-white" : "w-2 bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* section CTA */}
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
