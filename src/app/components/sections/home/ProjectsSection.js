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
                                            bgUrl = null,
                                            MobilebgUrl = null,
                                            items = [],     // [{ id, title, category, desc, image, href, ctas }]
                                            ctas = [],      // section-level CTAs [{ url, title, target }]
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
            aria-label="Selected projects"
        >
            {/* Background handling: desktop + mobile + fallback */}
            {hasBackground ? (
                <>
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat bg-fixed"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {MobilebgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${MobilebgUrl})` }}
                        />
                    )}

                    {!MobilebgUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.75),_rgba(0,0,0,0.96))]"
                    />
                </>
            ) : (
                <>
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#020617,_#020617)] md:bg-fixed"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.22),_transparent)]"
                    />
                </>
            )}

            <div className="v-sec__container relative z-10">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker v-kicker--light">{eyebrow}</p>}
                    <h2 className="v-title-xl text-white">{title}</h2>
                    {subtitle && <p className="v-sub text-white">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Grid of project cards */}
                <div className="v-grid-projects v-grid-projects--xl3 max-w-7xl mx-auto">
                    {items.map((p, idx) => {
                        const cardCtas = Array.isArray(p.ctas) ? p.ctas.filter(Boolean) : [];

                        return (
                            <article
                                key={p.id || idx}
                                className="
                                    group relative overflow-hidden
                                    rounded-[32px]
                                    border border-white/10
                                    bg-black/40
                                    shadow-[0_26px_70px_rgba(0,0,0,0.85)]
                                    backdrop-blur-2xl
                                    min-h-[320px] md:min-h-[360px]
                                    flex
                                "
                            >
                                {/* Project image as soft background */}
                                {p.image && (
                                    <Image
                                        src={p.image}
                                        alt={p.title || ""}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                                        className="object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-500"
                                        priority={idx < 2}
                                    />
                                )}

                                {/* Inner glow overlay */}
                                <div
                                    aria-hidden="true"
                                    className="
                                        absolute inset-0
                                        bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.55),_transparent)]
                                        mix-blend-screen
                                        opacity-70
                                    "
                                />

                                {/* Dark fade from bottom for text */}
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
                                />

                                {/* Card content */}
                                <div className="relative z-10 flex flex-col justify-between w-full px-4 md:px-5 pt-6 md:pt-7 pb-7 md:pb-8">
                                    {/* Top: kicker pill */}
                                    {p.category && (
                                        <div className="flex justify-end mb-4 md:mb-5">
                                            <span
                                                className="
                                                    inline-flex items-center
                                                    rounded-full
                                                    bg-black/40
                                                    border border-white/35
                                                    px-3.5 py-1
                                                    text-[11px] font-semibold
                                                    tracking-[0.18em] uppercase
                                                    text-slate-50
                                                    backdrop-blur-md
                                                "
                                            >
                                                {p.category}
                                            </span>
                                        </div>
                                    )}

                                    {/* Middle: title + description */}
                                    <div className="space-y-3 md:space-y-4">
                                        <h3
                                            className="
                                                text-lg md:text-xl
                                                font-semibold
                                                text-white
                                                leading-snug
                                                line-clamp-2
                                            "
                                            title={p.title}
                                        >
                                            {p.title || "Untitled project"}
                                        </h3>

                                        {p.desc && (
                                            <p
                                                className="
                                                    text-xs md:text-sm
                                                    text-slate-100/85
                                                    leading-relaxed
                                                    line-clamp-3
                                                "
                                            >
                                                {p.desc}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom: icon + CTAs */}
                                    <div
                                        className="
                                            mt-6 md:mt-7
                                            flex flex-nowrap items-center
                                            gap-3 md:gap-4
                                            pt-4 border-t border-white/10
                                        "
                                    >
                                        {/* Icon button */}
                                        <Link
                                            href={p.href || "#"}
                                            className="
                                                inline-flex items-center justify-center
                                                shrink-0
                                                aspect-square
                                                w-9 md:w-10
                                                rounded-full
                                                bg-[linear-gradient(90deg,#00C293_0%,#00E0A6_45%,#0A84FF_100%)]
                                                text-slate-900
                                                shadow-[0_10px_25px_rgba(3,105,161,0.65)]
                                                hover:shadow-[0_0_24px_rgba(0,194,147,0.95)]
                                                transition-all duration-200
                                            "
                                            aria-label={`Visit project: ${p.title || "Project"}`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="w-4 h-4 md:w-5 md:h-5"
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

                                        {/* Gradient CTAs */}
                                        {cardCtas.length > 0 &&
                                            cardCtas.map((c, i) =>
                                                c?.url ? (
                                                    <Link
                                                        key={i}
                                                        href={c.url}
                                                        target={c.target ?? "_self"}
                                                        className="
                                                            inline-flex items-center justify-center
                                                            rounded-full
                                                            px-4 md:px-5 py-2.5
                                                            text-[11px] md:text-sm font-semibold
                                                            text-slate-900
                                                            whitespace-nowrap
                                                            bg-[linear-gradient(90deg,#00C293_0%,#00E0A6_45%,#0A84FF_100%)]
                                                            shadow-[0_10px_30px_rgba(3,105,161,0.55)]
                                                            transition-all duration-200
                                                            hover:shadow-[0_0_32px_rgba(0,194,147,0.95)]
                                                            hover:brightness-110
                                                        "
                                                    >
                                                        {c.title ?? "More Info"}
                                                        <span
                                                            className="ml-2 text-sm"
                                                            aria-hidden="true"
                                                        >
                                                            →
                                                        </span>
                                                    </Link>
                                                ) : null
                                            )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Bottom CTA(s) */}
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
