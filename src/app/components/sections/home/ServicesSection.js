// /src/app/components/sections/home/ServicesSection.js
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * English-only comments (as requested).
 * Fixes:
 * - Force horizontal overflow: cards are always flex-none widths.
 * - Mobile: one card per view (w-[88vw]).
 * - "Wide" = the currently visible 3rd slot (active + 2).
 * - Arrows visible/clickable (z-index + pointer-events).
 * - Debug logs to console for quick diagnosis.
 */

function cx(...cls) {
    return cls.filter(Boolean).join(" ");
}
function stripTags(html) {
    if (!html) return "";
    return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ServicesSection({
                                            eyebrow = "Accelerate",
                                            title = "Our core services",
                                            subtitle = "Innovative solutions designed to drive your business forward with precision and intelligence.",
                                            contentHtml = "",
                                            bgUrl = null,
                                            items = [],
                                            sectionCta = { href: "/services", label: "View all services", target: null },
                                        }) {
    const hasItems = Array.isArray(items) && items.length > 0;

    // Carousel state
    const trackRef = useRef(null);
    const [active, setActive] = useState(0); // index of the first visible card
    const [cards, setCards] = useState([]);  // card DOM nodes

    // Collect card nodes after mount or items change
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const nodeList = el.querySelectorAll("[data-card]");
        const arr = Array.from(nodeList);
        setCards(arr);

        // Debug: initial track sizing
        const logInitial = () => {
            const cw = el.clientWidth;
            const sw = el.scrollWidth;
            // eslint-disable-next-line no-console
            console.log("[ServicesSection] mount: cards:", arr.length, "clientWidth:", cw, "scrollWidth:", sw);
            if (sw <= cw) {
                // eslint-disable-next-line no-console
                console.warn("[ServicesSection] WARNING: No horizontal overflow (scrollWidth <= clientWidth). Carousel won't scroll.");
                arr.forEach((n, i) => {
                    // eslint-disable-next-line no-console
                    console.log(`  card[${i}] offsetLeft=${n.offsetLeft} width=${n.offsetWidth} class="${n.className}"`);
                });
            }
        };
        logInitial();
    }, [items]);

    // Update "active" on scroll by picking closest card to scrollLeft
    useEffect(() => {
        const el = trackRef.current;
        if (!el || cards.length === 0) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                const { scrollLeft } = el;
                let bestIdx = 0;
                let bestDelta = Infinity;
                cards.forEach((c, i) => {
                    const delta = Math.abs(c.offsetLeft - scrollLeft);
                    if (delta < bestDelta) {
                        bestDelta = delta;
                        bestIdx = i;
                    }
                });
                setActive((prev) => (prev !== bestIdx ? bestIdx : prev));
                // eslint-disable-next-line no-console
                // console.log("[ServicesSection] scroll: scrollLeft", scrollLeft, "active", bestIdx);
            });
        };

        const onResize = () => {
            // Re-evaluate active after layout changes
            // eslint-disable-next-line no-console
            console.log("[ServicesSection] resize");
            onScroll();
            // Also re-log widths
            // eslint-disable-next-line no-console
            console.log(
                "[ServicesSection] clientWidth/scrollWidth",
                el.clientWidth,
                el.scrollWidth
            );
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        // initial
        onScroll();

        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [cards]);

    // Snap helpers
    const scrollToIndex = (i) => {
        const el = trackRef.current;
        if (!el || !cards[i]) return;
        // eslint-disable-next-line no-console
        console.log("[ServicesSection] scrollToIndex:", i);
        el.scrollTo({ left: cards[i].offsetLeft, behavior: "smooth" });
        setActive(i);
    };
    const scrollPrev = () => {
        const i = Math.max(0, active - 1);
        // eslint-disable-next-line no-console
        console.log("[ServicesSection] prev ->", i);
        scrollToIndex(i);
    };
    const scrollNext = () => {
        const i = Math.min(items.length - 1, active + 1);
        // eslint-disable-next-line no-console
        console.log("[ServicesSection] next ->", i);
        scrollToIndex(i);
    };

    // The currently visible 3rd slot
    const wideIndex = Math.min(items.length - 1, active + 2);

    return (
        <section
            id="services"
            className={cx("v-sec", "v-sec--scheme-2", "relative")}
            style={
                bgUrl
                    ? {
                        backgroundImage: `url(${bgUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }
                    : undefined
            }
        >
            {/* overlay 40% to match mock */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(0deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.40) 100%)",
                }}
            />

            <div className="v-sec__container relative">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? <div className="v-eyebrow">{eyebrow}</div> : null}
                    <h2 className="v-h2 mt-2">{title}</h2>
                    {subtitle ? <p className="v-subtitle mt-3">{subtitle}</p> : null}
                    {contentHtml ? (
                        <div className="v-copy mt-6" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    ) : null}
                </div>

                {/* Carousel */}
                <div className="v-sec__body mt-10">
                    <div className="relative">
                        {/* Track */}
                        <div
                            ref={trackRef}
                            className={cx(
                                "flex gap-8 overflow-x-auto pb-4 relative",
                                "snap-x snap-mandatory",
                                // hide scrollbar
                                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                                // mobile padding for breathing space
                                "px-4 sm:px-6 md:px-0"
                            )}
                        >
                            {hasItems ? (
                                items.map((card, idx) => {
                                    const isWide = idx === wideIndex;

                                    // Always prevent shrinking: flex-none
                                    // Mobile: single-card view via viewport width
                                    // >= md: wide ~624px, others ~360px
                                    const widthClasses = cx(
                                        "flex-none",
                                        "w-[88vw] sm:w-[82vw]",
                                        isWide ? "md:w-[624px]" : "md:w-[360px]"
                                    );

                                    return (
                                        <article
                                            key={card?.id ?? idx}
                                            data-card
                                            data-card-index={idx}
                                            className={cx(
                                                "v-card v-card--overlay",
                                                "snap-start rounded-2xl overflow-hidden",
                                                widthClasses
                                            )}
                                        >
                                            {/* Media with overlay */}
                                            <div className="relative w-full pointer-events-none">
                                                <div className={isWide ? "h-[335px]" : "h-[339px]"} />
                                                {card?.image ? (
                                                    <Image
                                                        src={card.image}
                                                        alt={card?.title || "Service image"}
                                                        fill
                                                        className="object-cover"
                                                        sizes={isWide ? "(min-width: 768px) 624px, 88vw" : "(min-width: 768px) 360px, 88vw"}
                                                        priority={idx < 3}
                                                    />
                                                ) : null}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.40) 100%)" }}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className={cx("absolute inset-0", isWide ? "p-6 md:p-12" : "p-6")}>
                                                <div className="h-full flex flex-col justify-between pointer-events-auto">
                                                    <div className="flex flex-col gap-2">
                                                        {card?.kicker ? <div className="v-kicker text-white">{card.kicker}</div> : null}

                                                        <h3 className={cx(isWide ? "text-[48px] leading-[57.6px] font-bold" : "v-h4", "text-white")}>
                                                            <Link href={card?.href || "#"} className="v-link-reset">
                                                                {card?.title || "Untitled service"}
                                                            </Link>
                                                        </h3>

                                                        {card?.excerpt ? (
                                                            <p className={cx(isWide ? "text-[18px] leading-[27px]" : "v-body", "text-white/90")}>
                                                                {stripTags(card.excerpt)}
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="flex items-center gap-6 mt-6">
                                                        <Link
                                                            href={card?.href || "#"}
                                                            className="rounded-full px-3 py-1.5 border-2 border-white text-white text-[18px] leading-[27px] font-medium"
                                                        >
                                                            Explore
                                                        </Link>

                                                        <Link
                                                            href={card?.cta?.url || card?.href || "#"}
                                                            target={card?.cta?.target || undefined}
                                                            className="flex items-center gap-2 text-white text-[18px] leading-[27px] font-medium"
                                                            aria-label={card?.cta?.title || "Learn"}
                                                        >
                                                            {card?.cta?.title || "Learn"}
                                                            <span aria-hidden className="inline-block translate-y-[1px]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                  <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                    <p className="v-subline">No services available. Add services in WordPress.</p>
                                </div>
                            )}
                        </div>

                        {/* Arrows */}
                        {hasItems && (
                            <>
                                <button
                                    type="button"
                                    onClick={scrollPrev}
                                    aria-label="Previous"
                                    className={cx(
                                        "absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-20",
                                        "rounded-full p-2 bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto"
                                    )}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={scrollNext}
                                    aria-label="Next"
                                    className={cx(
                                        "absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-20",
                                        "rounded-full p-2 bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto"
                                    )}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                                    className={cx("h-2 rounded-full transition-all", i === active ? "w-6 bg-white" : "w-2 bg-white/40")}
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
