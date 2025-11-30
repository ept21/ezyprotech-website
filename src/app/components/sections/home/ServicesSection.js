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

    const resolvedMobileBgUrl = bgMobileUrl || mobileBackgroundImage || null;
    const hasBackground = !!(bgUrl || resolvedMobileBgUrl);

    // Choose final background image: desktop first, then mobile if needed
    const finalBgImage = bgUrl || resolvedMobileBgUrl || null;

    // Section background style:
    // - If CMS image exists → use it as fixed background
    // - Else → use branded gradient fallback, also fixed
    const sectionStyle = hasBackground
        ? {
            backgroundImage: `url('${finalBgImage}')`,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
        }
        : {
            backgroundImage:
                "radial-gradient(120% 60% at 10% -10%, rgba(10,132,255,0.20), transparent), radial-gradient(120% 60% at 90% 110%, rgba(0,194,255,0.18), transparent)",
            backgroundColor: "#0B1220",
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
        };

    // --- Core Observer Logic (center active card) ---
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
            {/* Dark overlay for readability over any light background */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(120% 60% at 0% 0%, rgba(0,0,0,0.55), transparent), radial-gradient(140% 80% at 100% 100%, rgba(0,0,0,0.65), transparent)",
                }}
            />

            <div className="v-sec__container relative">
                {/* Head */}
                <div className="v-sec__head text-center max-w-3xl mx-auto">
                    {eyebrow ? (
                        <div className="v-eyebrow v-kicker--dark">{eyebrow}</div>
                    ) : null}
                    <h2 className="v-h2 mt-2 text-dark">{title}</h2>
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
                                                "relative snap-center overflow-hidden",
                                                widthClasses,
                                                // Light glass card with glow
                                                "rounded-2xl bg-white/80 backdrop-blur-md border border-white/60",
                                                "shadow-[0_0_26px_rgba(10,132,255,0.22)]",
                                                "transition-all duration-300 ease-out",
                                                "hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(10,132,255,0.45)]",
                                                isCurrentActive
                                                    ? "opacity-100 ring-2 ring-[rgba(10,132,255,0.8)]"
                                                    : "opacity-90 ring-1 ring-transparent"
                                            )}
                                            tabIndex={0}
                                        >
                                            {/* Media background */}
                                            <div className="relative w-full pointer-events-none">
                                                {/* Fixed height stub to keep layout stable */}
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
                                                {/* Softer overlay so the image pops more */}
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        background:
                                                            "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.78))",
                                                    }}
                                                />
                                            </div>

                                            {/* Content overlay */}
                                            <div
                                                className={cx(
                                                    "absolute inset-0",
                                                    isCurrentActive ? "p-6 md:p-8" : "p-6"
                                                )}
                                            >
                                                <div className="h-full flex flex-col items-center justify-center text-center gap-4 pointer-events-auto">
                                                    <div className="flex flex-col gap-2 items-center text-center">
                                                        {card?.kicker ? (
                                                            <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--brand-primary)]">
                                                                {card.kicker}
                                                            </div>
                                                        ) : null}
                                                        <h3
                                                            className={cx(
                                                                "font-heading font-bold",
                                                                isCurrentActive
                                                                    ? "text-[26px] md:text-[32px] leading-tight"
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
                                                                    "text-[15px] md:text-[16px] leading-relaxed",
                                                                    "text-[#5E6975]",
                                                                    "line-clamp-3"
                                                                )}
                                                            >
                                                                {stripTags(card.excerpt)}
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    {/* CTAs row */}
                                                    <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
                                                        <Link
                                                            href={card?.href || "#"}
                                                            className={cx(
                                                                "inline-flex items-center justify-center",
                                                                "rounded-full px-4 py-2",
                                                                "text-sm font-semibold",
                                                                "bg-[var(--brand-primary)] text-white",
                                                                "shadow-[0_0_24px_rgba(10,132,255,0.55)]",
                                                                "transition-transform transition-shadow duration-200 ease-out",
                                                                "hover:-translate-y-[1px] hover:shadow-[0_0_34px_rgba(10,132,255,0.75)]"
                                                            )}
                                                        >
                                                            Explore
                                                        </Link>

                                                        <Link
                                                            href={card?.cta?.url || card?.href || "#"}
                                                            target={card?.cta?.target || undefined}
                                                            className={cx(
                                                                "inline-flex items-center gap-2",
                                                                "text-sm font-medium",
                                                                "text-[#0B1220]",
                                                                "px-3 py-1.5 rounded-full",
                                                                "border border-[rgba(10,132,255,0.35)]",
                                                                "bg-white/60 hover:bg-white",
                                                                "shadow-[0_0_16px_rgba(10,132,255,0.25)]",
                                                                "transition-colors transition-shadow duration-200 ease-out"
                                                            )}
                                                            aria-label={card?.cta?.title || "Learn"}
                                                        >
                                                            {card?.cta?.title || "Learn"}
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
                                        "rounded-full bg-black/20 hover:bg-black/30 border border-white/40",
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
                                        "rounded-full bg-black/20 hover:bg-black/30 border border-white/40",
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
