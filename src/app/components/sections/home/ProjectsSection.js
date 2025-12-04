// /src/app/components/sections/home/ProjectsSection.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

/** NOTE: All comments must remain in English only. */
export default function ProjectsSection({
                                            eyebrow = "Deliver",
                                            title = "Featured projects",
                                            subtitle = "A snapshot of recent work — fast, scalable, and designed for growth.",
                                            contentHtml = "",
                                            bgUrl = null,          // desktop background
                                            MobilebgUrl = null,    // mobile background
                                            items = [],            // [{ id, title, category, desc, image, href, ctas }]
                                            ctas = [],             // optional section-level CTAs [{ url, title, target }]
                                        }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none text-white"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const hasBackground = Boolean(bgUrl || MobilebgUrl);

    return (
        <section
            id="projects"
            className="v-sec v-sec--scheme-2 relative overflow-hidden"
            data-v="projects"
        >
            {/* Background handling: desktop + mobile + fallback */}
            {hasBackground ? (
                <>
                    {/* Desktop background */}
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Mobile background */}
                    {MobilebgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${MobilebgUrl})` }}
                        />
                    )}

                    {/* Fallback: reuse desktop for mobile if mobile image is not set */}
                    {!MobilebgUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Dark overlay for readability */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/25"
                    />
                </>
            ) : (
                <>
                    {/* Default light background if no images were provided */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f4f7fb,_#dde5f3)]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,23,42,0.25),_transparent)]"
                    />
                </>
            )}

            <div className="v-sec__container relative z-10">
                {/* Header */}
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker v-kicker--light">{eyebrow}</p>}
                    <h2 className="v-title-xl text-white">{title}</h2>
                    {subtitle && <p className="v-sub text-white">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Grid Layout */}
                <div className="v-grid-projects v-grid-projects--xl4 max-w-7xl mx-auto">
                    {items.map((p, idx) => (
                        <article
                            key={p.id || idx}
                            className="v-project group"
                        >
                            {/* Image */}
                            {p.image ? (
                                <Image
                                    src={p.image}
                                    alt={p.title || ""}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="v-project__img transition-transform duration-500 group-hover:scale-105"
                                    priority={idx < 2}
                                />
                            ) : (
                                <div
                                    className="v-project__img absolute inset-0 bg-white/5"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                            {/* Content */}
                            <div className="v-project__content relative z-10">
                                <div className="v-project__body">
                                    {p.category && (
                                        <span className="v-badge self-start">
                                            {p.category}
                                        </span>
                                    )}

                                    <h3 className="v-project__title" title={p.title}>
                                        {p.title || "Untitled project"}
                                    </h3>

                                    {p.desc && (
                                        <p className="v-project__desc">
                                            {p.desc}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="v-project__actions">
                                    {/* Icon Button */}
                                    <Link
                                        href={p.href || "#"}
                                        className="btn-icon-only inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 hover:bg-white/20 transition text-white"
                                        aria-label={`Visit project: ${p.title || "Project"}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="w-5 h-5"
                                            fill="none"
                                        >
                                            <path
                                                d="M7 17L17 7M9 7H17V15"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </Link>

                                    {/* CTAs */}
                                    {Array.isArray(p.ctas) && p.ctas.length > 0 && (
                                        <>
                                            {p.ctas.map((c, i) =>
                                                c?.url ? (
                                                    <Link
                                                        key={i}
                                                        href={c.url}
                                                        target={c.target ?? "_self"}
                                                        className="btn-pill border-2 border-white text-white hover:bg-white hover:text-black transition-colors rounded-full"
                                                    >
                                                        {c.title ?? "Learn more"}
                                                    </Link>
                                                ) : null
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom Actions */}
                {ctas?.length ? (
                    <div className="v-actions">
                        {ctas.map((c, i) =>
                            c?.url ? (
                                <Link
                                    key={i}
                                    href={c.url}
                                    target={c.target ?? "_self"}
                                    className="btn-brand"
                                >
                                    {c.title ?? "See all projects"}
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : (
                    <div className="v-actions">
                        <Link
                            href="/projects"
                            className="btn-brand"
                            aria-label="See all projects"
                        >
                            See all projects
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
