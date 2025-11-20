"use client";

import Link from "next/link";
import Image from "next/image";

/** NOTE: All comments must remain in English only. */
export default function ProjectsSection({
                                            eyebrow = "Deliver",
                                            title = "Featured projects",
                                            subtitle = "A snapshot of recent work — fast, scalable, and designed for growth.",
                                            contentHtml = "",
                                            bgUrl = null,
                                            items = [],            // [{ id, title, category, desc, image, href, ctas }]
                                            ctas = []              // optional section-level CTAs [{ url, title, target }]
                                        }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const sectionBgStyle = bgUrl
        ? {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
        }
        : undefined;

    return (
        <section
            id="projects"
            className="v-sec v-sec--scheme-2 relative bg-center bg-cover bg-no-repeat"
            style={sectionBgStyle}
            data-v="projects"
        >
            {bgUrl && <div className="absolute inset-0 bg-black/25" aria-hidden="true" />}

            <div className="v-sec__container relative z-10">
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker v-kicker--light">{eyebrow}</p>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Grid Layout - Full width and stretching items */}
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
                                <div className="v-project__img absolute inset-0 bg-white/5" aria-hidden="true" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                            {/* Content */}
                            <div className="v-project__content relative z-10">

                                {/* Body: Badge + Title + Desc */}
                                <div className="v-project__body">
                                    {p.category && (
                                        <span className="v-badge self-start">{p.category}</span>
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

                                {/* Actions: ALL buttons in ONE single row */}
                                <div className="v-project__actions">
                                    {/* 1. Icon Button */}
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

                                    {/* 2. CTA Buttons - Direct siblings of the icon for one-line layout */}
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