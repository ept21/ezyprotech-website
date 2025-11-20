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
                                            items = [],            // [{ id, title, category, desc, image, href }]
                                            ctas = []              // optional section-level CTAs [{url,title,target}]
                                        }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const sectionBg = bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined;

    return (
        <section
            id="projects"
            className="v-sec v-sec--scheme-2 relative bg-center bg-cover bg-no-repeat"
            style={sectionBg}
            data-v="projects"
        >
            {bgUrl && <div className="absolute inset-0 bg-black/25" aria-hidden="true" />}
            <div className="v-sec__container relative z-10">
                {/* Header */}
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker v-kicker--light">{eyebrow}</p>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Grid — keep your classes to preserve design */}
                <div className="v-grid-projects v-grid-projects--xl4">
                    {items.map((p, idx) => (
                        <article key={p.id || idx} className="v-project">
                            {/* Background image */}
                            {p.image ? (
                                <Image
                                    src={p.image}
                                    alt={p.title || ""}
                                    width={1200}
                                    height={900}
                                    className="v-project__img"
                                    priority={false}
                                />
                            ) : (
                                <div className="v-project__img bg-white/5" aria-hidden="true" />
                            )}

                            {/* Overlay content */}
                            <div className="v-project__content">
                                {p.category ? <span className="v-badge">{p.category}</span> : null}
                                <h3 className="v-project__title">{p.title}</h3>
                                {p.desc ? <p className="v-project__desc">{p.desc}</p> : null}

                                <div className="v-project__actions">
                                    <Link
                                        href={p.href || "#"}
                                        className="btn-pill"
                                        aria-label={`View project: ${p.title || "Project"}`}
                                    >
                                        View project
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Section-level CTAs (optional) */}
                {ctas?.length ? (
                    <div className="v-actions">
                        {ctas.map((c, i) =>
                            c?.url ? (
                                <Link key={i} href={c.url} target={c.target ?? "_self"} className="btn-brand">
                                    {c.title ?? "See all projects"}
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : (
                    <div className="v-actions">
                        <Link href="/projects" className="btn-brand" aria-label="See all projects">
                            See all projects
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
