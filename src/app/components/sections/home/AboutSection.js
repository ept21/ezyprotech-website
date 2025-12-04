// /src/app/components/sections/home/AboutSection.jsx
"use client";

import Image from "next/image";
import Link from "next/link";

/** NOTE: All comments must remain in English only. */
export default function AboutSection({
                                         eyebrow = "Transform",
                                         title = "Intelligent technology meets strategic vision",
                                         subtitle = "We bridge the gap between cutting-edge AI technologies and practical business solutions.",
                                         contentHtml = "",
                                         bgUrl = null,
                                         bgMobileUrl = null, // mobile background
                                         images = [],        // array of up to 4 { src, alt, label } OR string URLs
                                         ctas = [],          // [{url,title,target}, ...]
                                     }) {
    const HTML = ({ html }) => (
        <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );

    const hasBackground = Boolean(bgUrl || bgMobileUrl);

    return (
        <section
            id="about"
            data-v="about"
            className="v-sec v-sec--scheme-1 relative overflow-hidden"
            role="region"
            aria-label="About Veltiqo"
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

                    {bgMobileUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgMobileUrl})` }}
                        />
                    )}

                    {!bgMobileUrl && bgUrl && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 md:hidden bg-center bg-cover bg-no-repeat"
                            style={{ backgroundImage: `url(${bgUrl})` }}
                        />
                    )}
                </>
            ) : (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f9fbff,_#e4ecf7)] md:bg-fixed"
                />
            )}

            <div className="v-sec__container relative z-10">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && <div className="v-kicker v-kicker--dark">{eyebrow}</div>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <h3 className="v-sub font-bold">{subtitle}</h3>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Simple round icons */}
                {images?.length ? (
                    <div className="flex flex-wrap items-start justify-center gap-6 md:gap-10">
                        {images.slice(0, 4).map((img, i) => {
                            const isObj = img && typeof img === "object";
                            const src = isObj ? img.src : img;
                            const alt = isObj ? img.alt || "" : "";
                            const label = isObj ? img.label || img.alt || "" : "";

                            if (!src) return null;

                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-start gap-3"
                                >
                                    <Image
                                        src={src}
                                        alt={alt}
                                        width={140}
                                        height={140}
                                        sizes="(max-width: 768px) 35vw, 15vw"
                                        className="
                      w-[120px] h-[120px] md:w-[140px] md:h-[140px]
                      rounded-[100px]
                      object-cover
                      border border-white/70
                      shadow-[0_18px_30px_rgba(15,23,42,0.3)]
                      bg-white/10
                      backdrop-blur-xl
                    "
                                        priority={i === 0}
                                    />

                                    {(label || alt) && (
                                        <h3 className="font-bold text-[11px] md:text-xs text-slate-900/85 text-center leading-snug max-w-[160px]">
                                            {label || alt}
                                        </h3>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : null}

                {/* Actions */}
                {ctas?.length ? (
                    <div className="v-actions mt-8 flex flex-wrap gap-4 justify-center">
                        {ctas.map((c, i) =>
                            c?.url ? (
                                <Link
                                    key={i}
                                    href={c.url}
                                    target={c.target ?? "_self"}
                                    className={
                                        i === 0 ? "btn-pill btn-pill--light" : "btn-link-dark"
                                    }
                                >
                                    {c.title ?? "Learn more"}{" "}
                                    {i !== 0 ? <span aria-hidden="true">→</span> : null}
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
