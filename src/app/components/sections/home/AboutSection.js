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

                {/* Images grid with circular icons */}
                {images?.length ? (
                    <div className="mt-[-40px] grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.slice(0, 4).map((img, i) => {
                            const isObj = img && typeof img === "object";
                            const src = isObj ? img.src : img;
                            const alt = isObj ? img.alt || "" : "";
                            const label = isObj ? img.label || img.alt || "" : "";

                            if (!src) return null;

                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-start gap-2"
                                >
                                    {/* Circular image */}
                                    <div
                                        className="
              flex items-center justify-center
              w-[96px] h-[96px] md:w-[110px] md:h-[110px]
              rounded-full
              bg-white/6
              shadow-[0_10px_28px_rgba(15,23,42,0.35)]
              backdrop-blur-xl
              overflow-hidden
            "
                                    >
                                        <Image
                                            src={src}
                                            alt={alt}
                                            width={110}
                                            height={110}
                                            sizes="(max-width: 768px) 35vw, 15vw"
                                            className="w-full h-full object-cover rounded-full"
                                            priority={i === 0}
                                        />
                                    </div>

                                    {/* Label under icon – fixed height for alignment */}
                                    {label && (
                                        <h3
                                            className="
                text-[14px] md:text-xs text-center leading-snug px-2 text-black font-bold
                min-h-[32px] md:min-h-[30px]
                flex items-center justify-center
              "
                                        >
                                            {label}
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
