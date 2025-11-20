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
                                         images = [],            // array of up to 4 image URLs
                                         ctas = []               // [{url,title,target}, ...]
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
            id="about"
            data-v="about"
            style={sectionBg}
            className="v-sec v-sec--scheme-1 relative bg-center bg-cover bg-no-repeat"
        >
            {bgUrl && <div className="absolute inset-0 bg-black/35" aria-hidden="true" />}
            <div className="v-sec__container relative z-10">
                {/* Heading */}
                <header className="v-head v-head--center">
                    {eyebrow && <div className="v-kicker v-kicker--light">{eyebrow}</div>}
                    <h2 className="v-title-xl">{title}</h2>
                    {subtitle && <p className="v-sub">{subtitle}</p>}
                    {contentHtml ? <HTML html={contentHtml} /> : null}
                </header>

                {/* Images grid (no cropping) */}
                {images?.length ? (
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.slice(0, 4).map((src, i) => (
                            <div
                                key={i}
                                className="rounded-xl bg-white/5 flex items-center justify-center p-3 md:p-4"
                                style={{ height: i === 0 ? 112 : 96 }} // ~28px/24px * 4 (tweak as you like)
                            >
                                <Image
                                    src={src}
                                    alt=""
                                    width={800}
                                    height={600}
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="max-h-full w-auto object-contain"
                                    priority={i === 0}
                                />
                            </div>
                        ))}
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
                                    className={i === 0 ? "btn-pill btn-pill--light" : "btn-link-dark"}
                                >
                                    {c.title ?? "Learn more"} {i !== 0 ? <span aria-hidden="true">→</span> : null}
                                </Link>
                            ) : null
                        )}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
