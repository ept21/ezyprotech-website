// app/(site)/bundle/[slug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { BUNDLE_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

/* ---------------- constants ---------------- */

const FRONTEND_BASE_URL =
    (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_SITE_URL &&
        process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")) ||
    "https://veltiqo.com";

/* ---------------- helpers ---------------- */

/** Resolve async params (Next.js quirk-safe) */
async function resolveParams(params) {
    if (!params) return {};
    if (typeof params.then === "function") {
        return await params;
    }
    return params;
}

/** Decode basic HTML entities for subtitles / descriptions */
function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

/** Map ACF link field into a clean href/label/target object */
function mapAcfLink(link, fallbackHref = "/contact") {
    if (!link) {
        return { href: fallbackHref, label: "", target: "_self" };
    }
    const href = link.url || fallbackHref;
    const label = link.title || "";
    const target = link.target && link.target !== "" ? link.target : "_self";
    return { href, label, target };
}

/** Fetch a single bundle by slug */
async function getRawBundle(slug) {
    if (!slug) return null;
    const data = await gqlRequest(BUNDLE_QUERY, { slug });
    return data?.bundle || null;
}

/** Normalize textarea (citations / FAQ) into clean lines */
function normalizeLines(value) {
    return (value || "")
        .split(/\r?\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
}

/** Parse FAQ textarea (Q:/A: format) into Question/Answer pairs */
function parseFaqText(block) {
    if (!block || typeof block !== "string") return [];

    const lines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    const faqs = [];
    let q = null;
    let a = null;

    for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("q:")) {
            if (q && a) faqs.push({ question: q, answer: a });
            q = line.slice(2).trim();
            a = null;
        } else if (lower.startsWith("a:")) {
            const part = line.slice(2).trim();
            a = a ? `${a} ${part}` : part;
        } else if (a) {
            a += " " + line;
        }
    }

    if (q && a) faqs.push({ question: q, answer: a });
    return faqs;
}

/** Generate Authority Schema JSON-LD string for a bundle */
function generateAuthoritySchemaJson(bundle) {
    const authority = bundle.authoritySchema || null;
    const seo = bundle.seo || null;
    if (!authority) return null;

    const {
        schemaType,
        aiSummary,
        primaryEntity,
        targetAudience,
        citations,
        faqSchema,
        reviewRating,
        reviewCount,
        productPrice,
        videoUrl,
        currencyCode,
    } = authority;

    const baseUrl = FRONTEND_BASE_URL;
    const url = `${baseUrl}/bundle/${bundle.slug}`;
    const title = bundle.title || "Bundle";
    const description =
        seo?.metaDesc ||
        aiSummary ||
        decodeHtmlEntities(
            bundle?.bundlesFields?.bundleShortDescription ||
            bundle?.bundlesFields?.subTitle ||
            ""
        ) ||
        "AI-powered growth bundle by Veltiqo.";

    const featuredImageUrl =
        getAcfImageUrl(bundle?.bundlesFields?.bundleHerobg) ||
        getAcfImageUrl(bundle?.featuredImage) ||
        null;

    const schema = {
        "@context": "https://schema.org",
        "@type": schemaType || "Product",
        name: title,
        description,
        url,
        image: featuredImageUrl || undefined,
        abstract: aiSummary || undefined,
        about: primaryEntity
            ? {
                "@type": "Thing",
                name: primaryEntity,
            }
            : {
                "@type": "Thing",
                name: title,
            },
        provider: {
            "@type": "Organization",
            name: "Veltiqo",
            url: baseUrl,
            logo: {
                "@type": "ImageObject",
                url: `${baseUrl}/assets/logo-main.png`,
            },
        },
        areaServed: {
            "@type": "Place",
            name: "Global",
        },
    };

    if (targetAudience) {
        schema.audience = {
            "@type": "BusinessAudience",
            audienceType: targetAudience,
        };
    }

    // Aggregate rating (optional, only if valid rating present)
    const ratingNumeric = reviewRating ? Number(reviewRating) : 0;
    if (!Number.isNaN(ratingNumeric) && ratingNumeric > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: ratingNumeric.toString(),
            reviewCount: reviewCount ? String(reviewCount) : "1",
        };
    }

    // Price and currency -> Offer (only for bundle/product pages)
    const priceNumeric = productPrice ? Number(productPrice) : 0;
    if (
        !Number.isNaN(priceNumeric) &&
        priceNumeric > 0 &&
        typeof currencyCode === "string" &&
        currencyCode.trim() !== ""
    ) {
        schema.offers = {
            "@type": "Offer",
            price: priceNumeric.toString(),
            priceCurrency: currencyCode.trim().toUpperCase(),
            availability: "https://schema.org/InStock",
            url,
        };
    }

    // Citations / trust signals
    const citationLines = normalizeLines(citations);
    if (citationLines.length > 0) {
        schema.citation = citationLines;
    }

    // FAQ (Q:/A: format text area -> mainEntity)
    const faqs = parseFaqText(faqSchema);
    if (faqs.length > 0) {
        schema.mainEntity = faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: f.answer,
            },
        }));
    }

    // Optional video object
    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim() !== "") {
        schema.subjectOf = {
            "@type": "VideoObject",
            contentUrl: videoUrl.trim(),
            name: `${title} – Bundle walkthrough`,
        };
    }

    return JSON.stringify(schema);
}

/* ---------------- Metadata ---------------- */

export async function generateMetadata({ params }) {
    const resolved = await resolveParams(params);
    const slug = resolved.slug;

    if (!slug) {
        return {
            title: "Bundle – Veltiqo",
            description:
                "AI-powered growth bundles from Veltiqo, combining services into one system.",
        };
    }

    const bundleRes = await gqlRequest(BUNDLE_QUERY, { slug });
    const bundle = bundleRes?.bundle || null;

    if (!bundle) {
        return {
            title: "Bundle not found – Veltiqo",
            description: "Requested bundle was not found.",
        };
    }

    const fields = bundle.bundlesFields || {};
    const fallbackImage =
        getAcfImageUrl(fields.bundleHerobg) ||
        getAcfImageUrl(bundle.featuredImage) ||
        null;

    const fallbackDescription =
        decodeHtmlEntities(
            fields.bundleShortDescription ||
            fields.subTitle ||
            fields.productsIncludes ||
            ""
        ) || "AI-powered growth bundle.";

    const canonicalUrl = `${FRONTEND_BASE_URL}/bundle/${bundle.slug}`;

    const baseMeta = yoastToMetadata({
        wpSeo: bundle.seo,
        fallbackTitle: fields.title || bundle.title,
        fallbackDescription,
        fallbackImage: fallbackImage
            ? {
                mediaItemUrl: fallbackImage,
                sourceUrl: fallbackImage,
                altText: fields.title || bundle.title,
            }
            : bundle.featuredImage?.node || null,
        siteUrl: canonicalUrl,
    });

    return {
        ...baseMeta,
        // Strengthen OG/Twitter with frontend URL and site name
        openGraph: {
            ...(baseMeta.openGraph || {}),
            url: canonicalUrl,
            siteName: "Veltiqo",
        },
        twitter: {
            ...(baseMeta.twitter || {}),
            card: baseMeta.twitter?.card || "summary_large_image",
        },
        // No keywords, no ai:* meta here – only Yoast core SEO.
    };
}

/* ---------------- UI mapping ---------------- */

function mapBundleToUi(bundle) {
    const fields = bundle.bundlesFields || {};

    const title =
        (fields.title && fields.title.trim()) || bundle.title || "Bundle";

    const hero = {
        kicker: fields.kicker || "Bundle",
        title,
        subtitle: fields.subTitle || "",
        shortDescription: fields.bundleShortDescription || "",
        price: fields.price || "",
        priceLabel: fields.textNearPriceMonthlyYearlyOrOther || "",
        bgDesktop:
            getAcfImageUrl(fields.bundleHerobg) ||
            getAcfImageUrl(bundle.featuredImage) ||
            null,
        bgMobile:
            getAcfImageUrl(fields.bundleMobileHerobg) ||
            getAcfImageUrl(fields.bundleHerobg) ||
            getAcfImageUrl(bundle.featuredImage) ||
            null,
        iconUrl: getAcfImageUrl(fields.bundleIcon) || null,
        primaryCta: mapAcfLink(fields.ctaurl1, "/contact"),
        secondaryCta: mapAcfLink(fields.ctaurl2, "/contact"),
    };

    const contentHtml = fields.bundleContent || bundle.content || "";
    const includes = decodeHtmlEntities(fields.productsIncludes || "");

    return {
        slug: bundle.slug,
        hero,
        contentHtml,
        includes,
    };
}

/* ---------------- Page component ---------------- */

export default async function BundlePage({ params }) {
    const resolved = await resolveParams(params);
    const slug = resolved.slug;

    if (!slug) {
        notFound();
    }

    const raw = await getRawBundle(slug);
    if (!raw) {
        notFound();
    }

    const data = mapBundleToUi(raw);
    const authoritySchemaJson = generateAuthoritySchemaJson(raw);

    return (
        <BundleTemplate bundle={data} authoritySchemaJson={authoritySchemaJson} />
    );
}

/* ---------------- UI Template ---------------- */

function BundleTemplate({ bundle, authoritySchemaJson }) {
    const { hero, contentHtml, includes } = bundle;

    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Authority Schema JSON-LD */}
            {authoritySchemaJson && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: authoritySchemaJson }}
                />
            )}

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#30363D]">
                {/* Desktop background */}
                {hero.bgDesktop && (
                    <div className="hidden md:block absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hero.bgDesktop})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#0D1117]/85 to-[#0D1117]" />
                    </div>
                )}

                {/* Mobile background */}
                {hero.bgMobile && (
                    <div className="md:hidden absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hero.bgMobile})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0D1117]/90 to-[#0D1117]" />
                    </div>
                )}

                {/* Fallback gradient if no images */}
                {!hero.bgDesktop && !hero.bgMobile && (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#00C29322,_transparent_55%),radial-gradient(circle_at_bottom,_#0A84FF22,_transparent_55%)]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0D1117]/80 to-[#0D1117]" />
                    </>
                )}

                <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] items-center">
                        {/* Left */}
                        <div className="max-w-3xl">
                            {hero.kicker && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                  {hero.kicker}
                </span>
                            )}

                            <div className="mt-4 flex items-center gap-3">
                                {hero.iconUrl && (
                                    <div className="w-10 h-10 rounded-2xl border border-[#30363D] bg-[#0D1117]/80 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={hero.iconUrl}
                                            alt={hero.title}
                                            className="w-8 h-8 object-contain"
                                        />
                                    </div>
                                )}
                                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                    {hero.title}
                                </h1>
                            </div>

                            {hero.subtitle && (
                                <p className="mt-3 text-sm md:text-base text-[#8B949E] max-w-2xl">
                                    {hero.subtitle}
                                </p>
                            )}

                            {hero.price && (
                                <div className="mt-4 inline-flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-[#00E0A6]">
                    {hero.price}
                  </span>
                                    {hero.priceLabel && (
                                        <span className="text-xs md:text-sm text-[#8B949E]">
                      {hero.priceLabel}
                    </span>
                                    )}
                                </div>
                            )}

                            {hero.shortDescription && (
                                <p className="mt-3 text-sm md:text-base text-[#C9D1D9]/85 max-w-2xl">
                                    {hero.shortDescription}
                                </p>
                            )}

                            {includes && (
                                <div className="mt-6">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8B949E] mb-2">
                                        Products include:
                                    </p>
                                    <div
                                        className="text-sm md:text-base text-[#C9D1D9]/85 max-w-2xl
                      space-y-1
                      [&_p]:mb-1
                      [&_ul]:list-disc [&_ul]:pl-5
                      [&_li]:mb-1"
                                        dangerouslySetInnerHTML={{ __html: includes }}
                                    />
                                </div>
                            )}

                            {(hero.primaryCta?.label || hero.secondaryCta?.label) && (
                                <div className="mt-8 flex flex-wrap gap-3">
                                    {hero.primaryCta?.label && (
                                        <Link
                                            href={hero.primaryCta.href}
                                            target={hero.primaryCta.target}
                                            className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-[#0A84FF] text-white hover:bg-[#0070E0] shadow-[0_0_22px_rgba(10,132,255,0.55)] hover:shadow-[0_0_30px_rgba(10,132,255,0.8)] transition-all text-sm md:text-base"
                                        >
                                            {hero.primaryCta.label}
                                        </Link>
                                    )}

                                    {hero.secondaryCta?.label && (
                                        <Link
                                            href={hero.secondaryCta.href}
                                            target={hero.secondaryCta.target}
                                            className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold border border-[#00C293]/60 bg-[#0D1117]/60 text-[#C9D1D9] hover:border-[#00C293] hover:text-[#00C293] transition-all text-sm md:text-base"
                                        >
                                            {hero.secondaryCta.label}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: summary card */}
                        <div className="max-w-md w-full ml-auto">
                            <div className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                <div className="px-6 pt-6 pb-5 border-b border-[#30363D]">
                                    <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wide mb-2">
                                        Bundle overview
                                    </p>
                                    {hero.price && (
                                        <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#00E0A6]">
                        {hero.price}
                      </span>
                                            {hero.priceLabel && (
                                                <span className="text-xs text-[#8B949E]">
                          {hero.priceLabel}
                        </span>
                                            )}
                                        </div>
                                    )}
                                    {hero.shortDescription && (
                                        <p className="mt-2 text-xs text-[#C9D1D9]/80">
                                            {hero.shortDescription}
                                        </p>
                                    )}
                                </div>

                                {includes && (
                                    <div className="px-6 py-5 border-b border-[#30363D]">
                                        <p className="text-xs font-semibold text-[#8B949E] uppercase tracking-wide mb-2">
                                            Key components
                                        </p>
                                        <div
                                            className="text-xs text-[#C9D1D9]/85 space-y-1
                        [&_ul]:list-disc [&_ul]:pl-5
                        [&_li]:mb-1"
                                            dangerouslySetInnerHTML={{ __html: includes }}
                                        />
                                    </div>
                                )}

                                <div className="px-6 py-5 flex flex-col gap-3">
                                    <Link
                                        href={hero.primaryCta?.href || "/contact"}
                                        target={hero.primaryCta?.target || "_self"}
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold bg-[#0A84FF] hover:bg-[#0070E0] text-white text-sm shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] transition-all"
                                    >
                                        Talk to our team
                                    </Link>
                                    <Link
                                        href="/bundles"
                                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold border border-[#30363D] bg-[#161B22] text-xs text-[#C9D1D9] hover:border-[#00C293] hover:text-[#00C293] transition-all"
                                    >
                                        Explore all bundles
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-10">
                    <article className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
                        {contentHtml ? (
                            <div
                                className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white prose-li:text-[#C9D1D9]"
                                dangerouslySetInnerHTML={{ __html: contentHtml }}
                            />
                        ) : (
                            <p className="text-[#8B949E] text-sm">
                                Detailed breakdown for this bundle will be added soon.
                            </p>
                        )}
                    </article>

                    <aside className="space-y-6">
                        <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
                            <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                                Want to customize this bundle?
                            </h2>
                            <p className="text-xs md:text-sm text-[#8B949E] mb-4">
                                We can adjust the scope, pricing, and components around your
                                stack and goals.
                            </p>
                            <Link
                                href={hero.primaryCta?.href || "/contact"}
                                target={hero.primaryCta?.target || "_self"}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold bg-[#0A84FF] hover:bg-[#0070E0] text-white text-sm shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] transition-all"
                            >
                                Talk to our team
                            </Link>
                        </div>

                        <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6">
                            <h3 className="text-sm font-semibold text.white mb-2">
                                Explore all bundles
                            </h3>
                            <p className="text-xs text-[#8B949E] mb-3">
                                Compare different bundles across automation, growth, and web
                                foundations.
                            </p>
                            <Link
                                href="/bundles"
                                className="inline-flex items-center text-xs font-semibold text-white hover:text-[#00C293] transition-colors"
                            >
                                Back to bundles overview →
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
