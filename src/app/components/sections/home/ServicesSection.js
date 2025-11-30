// /src/app/components/sections/home/ServicesSection.js
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
    const isScrollingByJSRef = useRef(false);

    const cardRefs = useRef([]);
    const observerRef = useRef(null);
    const timeoutRef = useRef(null);

    const resolvedMobileBgUrl = bgMobileUrl || mobileBackgroundImage || null;
    const hasBackground = !!(bgUrl || resolvedMobileBgUrl);

    // Expose background URLs as CSS variables for the section
    const sectionStyle = hasBackground
        ? {
            "--v-sec-bg-image": bgUrl ? `url('${bgUrl}')` : undefined,
            "--v-sec-bg-image-mobile": resolvedMobileBgUrl
                ? `url('${resolvedMobileBgUrl}')`
                : undefined,
        }
        : undefined;

    // --- Core Observer Logic ---
    const initializeObserver = useCallback(() => {
        if (cardRefs.current.length === 0 || !trackRef.current) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerCallback = (entries) => {
            if (isScrollingByJSRef.current) return;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            const mostVisible = entries.find((entry) => entry.intersectionRatio >= 0.75);

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
    }, [hasItems, items.length]);

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
        const offset = target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2;
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
            {/* Dark overlay for readability (sits above CSS background, below content) */}
            {/*{hasBackground && (*/}
            {/*    <div*/}
            {/*        aria-hidden*/}
            {/*        className="absolute inset-0 -z-10 pointer-events-none"*/}
            {/*        style={{*/}
            {/*            background: "linear-gradient(0deg, rgba(0,0,0,.40), rgba(0,0,0,.40))",*/}
            {/*        }}*/}
            {/*    />*/}
            {/*)}*/}

            <div className="v-sec__container relative">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? <div className="v-eyebrow v-kicker--dark">{eyebrow}</div> : null}
                    <h2 className="v-h2 mt-2 text-white">{title}</h2>
                    {subtitle ? (
                        <p className="v-subtitle mt-3 text-dark/90">{subtitle}</p>
                    ) : null}
                    {contentHtml ? (
                        <div
                            className="v-copy mt-6 text-dark/90"
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
                                "flex overflow-x-auto relative",
                                "py-8",
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
                                        "w-[90vw]",
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
                                            {/* Media */}
                                            <div className="relative w-full pointer-events-none">
                                                <div className={isCurrentActive ? "h-[335px]" : "h-[339px]"} />
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
                                                            "linear-gradient(0deg, rgba(0,0,0,.20), rgba(0,0,0,.20))",
                                                    }}
                                                />
                                            </div>

                                            {/* Content */}
                                            <div
                                                className={cx(
                                                    "absolute inset-0",
                                                    isCurrentActive ? "p-6 md:p-12" : "p-6"
                                                )}
                                            >
                                                <div className="h-full flex flex-col justify-between pointer-events-auto">
                                                    <div className="flex flex-col gap-2">
                                                        {card?.kicker ? (
                                                            <div className="v-kicker">{card.kicker}</div>
                                                        ) : null}
                                                        <h3
                                                            className={cx(
                                                                isCurrentActive
                                                                    ? "text-4xl lg:text-[48px] leading-tight font-bold"
                                                                    : "v-h4",
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
                                                            className="flex items-center gap-2 text-[18px] leading-[27px] font-medium hover:text-brand-accent transition"
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
                                    <p className="v-subline text-white">No services available.</p>
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
                                        "rounded-full bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto transition",
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
                                        "rounded-full bg-white/10 hover:bg-white/20 border border-white/20",
                                        "backdrop-blur-sm text-white pointer-events-auto transition",
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
                                        "h-2 rounded-full transition-all",
                                        i === active ? "w-6 bg-white" : "w-2 bg-white/40"
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
