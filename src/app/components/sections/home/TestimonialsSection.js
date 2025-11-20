"use client";

import Link from "next/link";
import Image from "next/image";

/** NOTE: All comments must remain in English only. */
export default function TestimonialsSection({
                                                eyebrow = "Trust",
                                                title = "Client success stories",
                                                subtitle = "Real results from businesses that transformed with Veltiqo.",
                                                contentHtml = "",
                                                bgUrl = null,
                                                items = [],   // [{ id, stars, kicker, quote, name, company, businessType, avatar, singleReview, googleReview, videoUrl }]
                                                ctas = [],    // section-level CTAs [{ url, title, target }]
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

    // JS only – no TypeScript types here
    const renderStars = (count) => {
        const safe = Math.max(0, Math.min(5, Number(count) || 0));
        return (
            <div className="v-stars" aria-label={`${safe} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < safe;
                    return (
                        <span
                            key={i}
                            className={`v-star${filled ? "" : " v-star--empty"}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d="M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.55L12 17.9l-5.8 3.45 1.1-6.55-4.7-4.58 6.5-.94L12 2.5z" />
                            </svg>
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <section
            id="testimonials"
            className="v-sec v-sec--scheme-3"
            style={sectionBgStyle}
        >
            <div className="v-sec__container">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker">{eyebrow}</p>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Cards */}
                <div className="v-grid-3--equal">
                    {items.map((t, idx) => (
                        <article
                            key={t.id || idx}
                            className="v-testi glass-card"
                        >
                            <div className="v-testi__body">
                                {/* Stars */}
                                {renderStars(t.stars)}

                                {/* Optional kicker above quote */}
                                {t.kicker && (
                                    <p className="text-xs uppercase tracking-[0.18em] text-brand/70 mb-1">
                                        {t.kicker}
                                    </p>
                                )}

                                {/* Quote */}
                                {t.quote && (
                                    <p className="v-testi__quote">
                                        {t.quote}
                                    </p>
                                )}
                            </div>

                            {/* Footer: avatar + name/company */}
                            <footer className="v-testi__footer">
                                {t.avatar ? (
                                    <Image
                                        src={t.avatar}
                                        alt={t.name || ""}
                                        width={48}
                                        height={48}
                                        className="v-avatar rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="v-avatar v-avatar--fallback">
                                        {t.name?.charAt(0) || "V"}
                                    </div>
                                )}

                                <div className="v-person">
                                    <div className="v-person__name">
                                        {t.name}
                                    </div>
                                    <div className="v-person__role">
                                        {[t.company, t.businessType]
                                            .filter(Boolean)
                                            .join(" • ")}
                                    </div>
                                </div>
                            </footer>

                            {/* Optional links row under footer */}
                            {(t.singleReview || t.googleReview || t.videoUrl) && (
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand/80">
                                    {t.singleReview?.url && (
                                        <Link
                                            href={t.singleReview.url}
                                            target={t.singleReview.target ?? "_blank"}
                                            className="underline-offset-2 hover:underline"
                                        >
                                            {t.singleReview.title || "Full review"}
                                        </Link>
                                    )}
                                    {t.googleReview?.url && (
                                        <Link
                                            href={t.googleReview.url}
                                            target={t.googleReview.target ?? "_blank"}
                                            className="underline-offset-2 hover:underline"
                                        >
                                            {t.googleReview.title || "Google review"}
                                        </Link>
                                    )}
                                    {t.videoUrl && (
                                        <Link
                                            href={t.videoUrl}
                                            target="_blank"
                                            className="underline-offset-2 hover:underline"
                                        >
                                            Watch video
                                        </Link>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>

                {/* Section-level CTAs */}
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
                                    {c.title ?? "Read more reviews"}
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
