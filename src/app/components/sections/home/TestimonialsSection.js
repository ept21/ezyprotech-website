// /src/app/components/sections/home/TestimonialsSection.jsx
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
                                                mobileBgUrl = null,
                                                items = [],   // [{ id, stars, kicker, quote, name, company, businessType, avatar, singleReview, googleReview, videoUrl }]
                                                ctas = [],    // section-level CTAs [{ url, title, target }]
                                            }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    // Star renderer – orange rating, up to 5
    const renderStars = (count) => {
        const safe = Math.max(0, Math.min(5, Number(count) || 0));

        return (
            <div className="flex items-center gap-1" aria-label={`${safe} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < safe;
                    return (
                        <span
                            key={i}
                            className={
                                filled
                                    ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                                    : "text-white/25"
                            }
                        >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  aria-hidden="true"
              >
                <path
                    fill="currentColor"
                    d="M12 2.5l2.9 5.88 6.5.94-4.7 4.58 1.1 6.55L12 17.9l-5.8 3.45 1.1-6.55-4.7-4.58 6.5-.94L12 2.5z"
                />
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
            data-v="testimonials"
            className="v-sec v-sec--scheme-3 relative overflow-hidden"
            role="region"
            aria-label="Client testimonials"
        >
            {/* Background: desktop + mobile, both fixed */}
            {bgUrl || mobileBgUrl ? (
                <>
                    {/* Desktop background */}
                    {bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 hidden md:block bg-center bg-cover bg-no-repeat bg-fixed"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Mobile background */}
                    {mobileBgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat bg-fixed"
                            style={{ backgroundImage: `url(${mobileBgUrl})` }}
                        />
                    )}

                    {/* Fallback: reuse desktop for mobile if no mobile image */}
                    {!mobileBgUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}

                    {/* Soft wash over background for readability */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.75),_rgba(15,23,42,0.15))]"
                    />
                </>
            ) : (
                <>
                    {/* Default light gradient if no image */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f9fbff,_#e4ecf7)] bg-fixed"
                    />
                </>
            )}

            <div className="v-sec__container relative z-10">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && <p className="v-kicker v-kicker--dark">{eyebrow}</p>}
                    <h2 className="v-title-xl text-slate-900">{title}</h2>
                    {subtitle && <p className="v-sub text-slate-800">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Cards grid */}
                <div className="mt-10 grid gap-6 md:gap-8 md:grid-cols-3">
                    {items.map((t, idx) => {
                        const hasBottomLinks = t.singleReview || t.googleReview || t.videoUrl;

                        return (
                            <article
                                key={t.id || idx}
                                className="
                  group relative rounded-[32px] border border-white/70
                  bg-white/60 bg-clip-padding
                  shadow-[0_22px_60px_rgba(15,23,42,0.28)]
                  backdrop-blur-2xl
                  px-6 pt-5 pb-5 md:px-7 md:pt-6 md:pb-6
                  before:absolute before:inset-0 before:-z-10
                  before:rounded-[36px]
                  before:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.75),_rgba(56,189,248,0)_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.6),_rgba(16,185,129,0)_55%)]
                  before:opacity-70
                "
                            >
                                {/* Body */}
                                <div className="flex flex-col gap-3">
                                    {/* Stars row */}
                                    {renderStars(t.stars)}

                                    {/* Kicker pill */}
                                    {t.kicker && (
                                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
                      {t.kicker}
                    </span>
                                    )}

                                    {/* Quote */}
                                    {t.quote && (
                                        <p className="text-[13px] md:text-sm leading-relaxed text-slate-800">
                                            {t.quote}
                                        </p>
                                    )}
                                </div>

                                {/* Person strip + buttons */}
                                <div className="mt-5 rounded-2xl bg-white/85 px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.18)]">
                                    {/* Person row */}
                                    <div className="flex items-center gap-3">
                                        {t.avatar ? (
                                            <Image
                                                src={t.avatar}
                                                alt={t.name || ""}
                                                width={44}
                                                height={44}
                                                className="h-11 w-11 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                                {t.name?.charAt(0) || "V"}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {t.name}
                                            </div>
                                            <div className="truncate text-xs text-slate-600">
                                                {[t.company, t.businessType].filter(Boolean).join(" • ")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Links row */}
                                    {hasBottomLinks && (
                                        <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                            {/* Read more (singleReview) – gradient pill */}
                                            {t.singleReview?.url && (
                                                <Link
                                                    href={t.singleReview.url}
                                                    target={t.singleReview.target ?? "_blank"}
                                                    className="
                            inline-flex items-center justify-center
                            rounded-full px-4 py-2 text-xs font-semibold
                            text-slate-900
                            bg-[linear-gradient(90deg,#00C293,#00C2FF)]
                            shadow-[0_10px_25px_rgba(15,23,42,0.35)]
                            transition-transform duration-150
                            group-hover:shadow-[0_16px_40px_rgba(15,23,42,0.45)]
                            hover:-translate-y-[1px]
                          "
                                                >
                                                    {t.singleReview.title || "Read more"}
                                                    <span className="ml-2 text-[13px]" aria-hidden="true">
                            →
                          </span>
                                                </Link>
                                            )}

                                            {/* Google review button */}
                                            {t.googleReview?.url && (
                                                <Link
                                                    href={t.googleReview.url}
                                                    target={t.googleReview.target ?? "_blank"}
                                                    className="
                            inline-flex items-center gap-1.5 rounded-full
                            border border-slate-200 bg-white/80 px-3 py-1.5
                            text-[11px] font-medium text-slate-800 shadow-sm
                            hover:bg-white
                          "
                                                >
                                                    {/* Simple G badge */}
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            G
                          </span>
                                                    <span>{t.googleReview.title || "Google review"}</span>
                                                </Link>
                                            )}

                                            {/* Video button */}
                                            {t.videoUrl && (
                                                <Link
                                                    href={t.videoUrl}
                                                    target="_blank"
                                                    className="
                            inline-flex items-center gap-1.5 rounded-full
                            border border-slate-200 bg-white/80 px-3 py-1.5
                            text-[11px] font-medium text-slate-800 shadow-sm
                            hover:bg-white
                          "
                                                >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-3 w-3"
                                aria-hidden="true"
                            >
                              <path
                                  fill="currentColor"
                                  d="M9 7.5l7 4.5-7 4.5V7.5z"
                              />
                            </svg>
                          </span>
                                                    <span>Watch video</span>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
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
