// app/(site)/bundles/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { BUNDLES_PAGE_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

// Frontend base URL for schema (can be overridden via env)
const FRONTEND_BASE_URL =
    (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://veltiqo.com").replace(
        /\/+$/,
        ""
    );

// If your query uses URI: const BUNDLES_PAGE_URI = "/bundles/";
// If it uses DATABASE_ID: you can store the numeric ID instead.
const BUNDLES_PAGE_URI = "/bundles/";

/* ---------------- Helpers ---------------- */

function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

function mapAcfLink(link, fallbackHref = "/contact") {
    if (!link) {
        return { href: fallbackHref, label: "", target: "_self" };
    }
    const href = link.url || fallbackHref;
    const label = link.title || "";
    const target = link.target && link.target !== "" ? link.target : "_self";
    return { href, label, target };
}

function normalizeLines(value) {
    return (value || "")
        .split(/\r?\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
}

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

/**
 * Generate Authority Schema JSON-LD for the Bundles overview page.
 * Uses the AuthoritySchema ACF group on the page (if filled).
 * This is completely independent of seoEnhancements.
 */
function generateAuthoritySchemaJsonForPage(page) {
    const authority = page?.authoritySchema || null;
    const seo = page?.seo || null;

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
    const url = `${baseUrl}/bundles/`;

    const title =
        page?.title || "Bundles – Veltiqo"; // Fallback title if Yoast not set for schema.

    const description =
        seo?.metaDesc ||
        aiSummary ||
        decodeHtmlEntities(
            page?.bundlesPageFields?.bundlesshortdescription || ""
        ) ||
        "AI-powered growth bundles that connect marketing, automation, web, and analytics into one system.";

    const featuredImageUrl =
        getAcfImageUrl(page?.bundlesPageFields?.bundlesimage) ||
        getAcfImageUrl(page?.featuredImage) ||
        null;

    const schema = {
        "@context": "https://schema.org",
        "@type": schemaType || "CollectionPage",
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
            : undefined,
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

    // Aggregate rating (optional).
    // In practice this will usually be relevant on single bundle pages,
    // but if you fill it here the schema will still be valid.
    const ratingNumeric = reviewRating ? Number(reviewRating) : 0;
    if (!Number.isNaN(ratingNumeric) && ratingNumeric > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: ratingNumeric.toString(),
            reviewCount: reviewCount ? String(reviewCount) : "1",
        };
    }

    // Offer (optional) — same note as above: typically for product pages,
    // but kept here in case you intentionally configure it on the collection.
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

    const citationLines = normalizeLines(citations);
    if (citationLines.length > 0) {
        schema.citation = citationLines;
    }

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

    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim() !== "") {
        schema.subjectOf = {
            "@type": "VideoObject",
            contentUrl: videoUrl.trim(),
            name: `${title} – Bundles overview`,
        };
    }

    return JSON.stringify(schema);
}

/* ---------------- Data fetch ---------------- */

async function getBundlesPageData() {
    // IMPORTANT:
    // If your BUNDLES_PAGE_QUERY uses `$slug` + `idType: URI`,
    // keep `slug: BUNDLES_PAGE_URI`.
    // If you changed it to `$id` + `idType: DATABASE_ID`,
    // change this to `id: <numeric_id>`.
    const data = await gqlRequest(BUNDLES_PAGE_QUERY, {
        slug: BUNDLES_PAGE_URI,
        firstBundles: 100,
    });

    if (!data?.page) return null;

    return {
        page: data.page,
        bundles: data.bundles?.nodes || [],
    };
}

/* ---------------- Metadata ---------------- */

export async function generateMetadata() {
    const bundlesRes = await gqlRequest(BUNDLES_PAGE_QUERY, {
        slug: BUNDLES_PAGE_URI,
        firstBundles: 1,
    });

    const page = bundlesRes?.page || null;
    if (!page) {
        return {
            title: "Bundles – Veltiqo",
            description:
                "AI-powered growth bundles that connect marketing, automation, web, and analytics into one system.",
        };
    }

    const fields = page.bundlesPageFields || page.bundlespageFields || {};
    const fallbackImage = page.featuredImage?.node || null;

    const baseMeta = yoastToMetadata({
        wpSeo: page.seo,
        fallbackTitle: fields.bundelstitle || page.title || "Bundles – Veltiqo",
        fallbackDescription:
            fields.bundlesshortdescription ||
            decodeHtmlEntities(
                (page.excerpt || "").slice(0, 180) ||
                "AI-powered growth bundles that connect marketing, automation, web, and analytics into one system."
            ),
        fallbackImage,
    });

    // No seoEnhancements used here at all – purely Yoast + minimal fallbacks.
    // No ai:* meta and no custom keywords meta injection.

    return {
        ...baseMeta,
    };
}

/* ---------------- UI mapping ---------------- */

function mapToUi(page, bundlesNodes) {
    const fields = page.bundlesPageFields || page.bundlespageFields || {};

    const hero = {
        kicker: fields.kicker || "Bundles",
        title: fields.bundelstitle || page.title || "Bundles",
        subtitle: decodeHtmlEntities(fields.bundlessubtitle || ""),
        shortDescription: decodeHtmlEntities(fields.bundlesshortdescription || ""),
        bgDesktop: getAcfImageUrl(fields.bundlesherobgimage) || null,
        bgMobile:
            getAcfImageUrl(fields.bundlesheromobilebgimage) ||
            getAcfImageUrl(fields.bundlesherobgimage) ||
            null,
        heroImage:
            getAcfImageUrl(fields.bundlesimage) ||
            getAcfImageUrl(page.featuredImage) ||
            null,
        primaryCta: mapAcfLink(fields.ctaurl1, "/contact"),
        secondaryCta: mapAcfLink(fields.ctaurl2, "/contact"),
    };

    const contentHtml = fields.bundlescontent || page.content || "";

    const bundles = bundlesNodes.map((b) => {
        const bf = b.bundlesFields || {};
        return {
            slug: b.slug,
            title: bf.title || b.title,
            kicker: bf.kicker || "",
            price: bf.price || "",
            priceLabel: bf.textNearPriceMonthlyYearlyOrOther || "",
            // Keep HTML for rich list rendering
            productsIncludes: decodeHtmlEntities(bf.productsIncludes || ""),
            primaryCta: mapAcfLink(bf.ctaurl1, `/bundle/${b.slug}`),
            secondaryCta: mapAcfLink(bf.ctaurl2, "/contact"),
            featuredUrl: getAcfImageUrl(b.featuredImage) || null,
        };
    });

    return { hero, contentHtml, bundles };
}

/* ---------------- Page component ---------------- */

export default async function BundlesPage() {
    const data = await getBundlesPageData();
    if (!data) {
        notFound();
    }

    const ui = mapToUi(data.page, data.bundles);
    const authoritySchemaJson = generateAuthoritySchemaJsonForPage(data.page);

    return <BundlesTemplate {...ui} authoritySchemaJson={authoritySchemaJson} />;
}

/* ---------------- UI Template ---------------- */

function BundlesTemplate({ hero, contentHtml, bundles, authoritySchemaJson }) {
    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Authority Schema JSON-LD
          Note: rendered in the body, which is still valid for Google.
          If we later want a head-only implementation, we can move this
          into a dedicated head.js for this route. */}
            {authoritySchemaJson && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: authoritySchemaJson }}
                />
            )}

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#30363D]">
                {hero.bgDesktop && (
                    <div className="hidden md:block absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hero.bgDesktop})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0D1117]/80 to-[#0D1117]" />
                    </div>
                )}

                {hero.bgMobile && (
                    <div className="md:hidden absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hero.bgMobile})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0D1117]/85 to-[#0D1117]" />
                    </div>
                )}

                <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] items-center">
                        {/* Left column */}
                        <div className="max-w-3xl">
                            {hero.kicker && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                  {hero.kicker}
                </span>
                            )}

                            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                {hero.title}
                            </h1>

                            {hero.subtitle && (
                                <p className="mt-3 text-base md:text-lg text-[#8B949E] max-w-2xl">
                                    {hero.subtitle}
                                </p>
                            )}

                            {hero.shortDescription && (
                                <p className="mt-3 text-sm md:text-base text-[#C9D1D9]/85 max-w-2xl">
                                    {hero.shortDescription}
                                </p>
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

                        {/* Right column: hero image */}
                        {hero.heroImage && (
                            <div className="max-w-md w-full ml-auto">
                                <div className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                    <div className="relative w-full pt-[62%]">
                                        <img
                                            src={hero.heroImage}
                                            alt={hero.title || "Bundles visual"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-transparent to-transparent" />
                                    </div>
                                    <div className="px-5 py-4 border-t border-[#30363D] bg-[#161B22]/95">
                                        <p className="text-xs text-[#8B949E]">
                                            Overview of Veltiqo&apos;s AI-powered growth bundles.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content block */}
            <section className="max-w-[1440px] mx-auto px-6 pt-12 md:pt-16">
                {contentHtml && (
                    <article className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8 mb-12 shadow-[0_0_24px_rgba(0,0,0,0.45)]">
                        <div
                            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white prose-li:text-[#C9D1D9]"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </article>
                )}
            </section>

            {/* Bundles grid */}
            <section className="max-w-[1440px] mx-auto px-6 pb-16 md:pb-20">
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-white">
                        All bundles
                    </h2>
                    <p className="text-xs md:text-sm text-[#8B949E]">
                        Pre-built combinations of services designed for real growth needs.
                    </p>
                </div>

                {bundles.length === 0 ? (
                    <p className="text-[#8B949E] text-sm">
                        Bundles will be added here soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {bundles.map((bundle) => (
                            <article
                                key={bundle.slug}
                                className="group bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden flex flex-col h-full hover:border-[#00C293]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00C293]/5"
                            >
                                {/* Top visual */}
                                <div className="h-40 bg-[#0D1117] relative overflow-hidden">
                                    {bundle.featuredUrl && (
                                        <img
                                            src={bundle.featuredUrl}
                                            alt={bundle.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/85 via-transparent to-transparent" />
                                    {bundle.kicker && (
                                        <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                        {bundle.kicker}
                      </span>
                                        </div>
                                    )}
                                    {bundle.price && (
                                        <div className="absolute bottom-4 right-4 rounded-2xl bg-[#0D1117]/90 border border-[#00C293]/70 px-3 py-1.5 text-xs font-semibold text-[#00E0A6] shadow-[0_0_16px_rgba(0,194,147,0.6)]">
                                            {bundle.price}
                                            {bundle.priceLabel && (
                                                <span className="ml-1 text-[11px] text-[#8B949E]">
                          {bundle.priceLabel}
                        </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-[#00C293] transition-colors">
                                        {bundle.title}
                                    </h3>

                                    {bundle.productsIncludes && (
                                        <div
                                            className="text-[#C9D1D9] text-sm mb-6 flex-grow space-y-1
                        [&_p]:mb-1
                        [&_ul]:list-disc [&_ul]:pl-5
                        [&_li]:mb-1"
                                            dangerouslySetInnerHTML={{
                                                __html: bundle.productsIncludes,
                                            }}
                                        />
                                    )}

                                    <div className="mt-auto flex flex-wrap gap-3">
                                        <Link
                                            href={`/bundle/${bundle.slug}`}
                                            className="inline-flex items-center text-sm font-semibold text-white group-hover:text-[#00C293] transition-colors"
                                        >
                                            View bundle details →
                                        </Link>

                                        {bundle.secondaryCta?.label && (
                                            <Link
                                                href={bundle.secondaryCta.href}
                                                target={bundle.secondaryCta.target}
                                                className="inline-flex items-center text-xs font-semibold text-[#C9D1D9] hover:text-[#0A84FF] transition-colors"
                                            >
                                                {bundle.secondaryCta.label}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Bottom CTA */}
            <section className="max-w-[1440px] mx-auto px-6 pb-10">
                <div className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Need a custom bundle?
                        </h2>
                        <p className="text-xs md:text-sm text-[#8B949E] mt-1">
                            We can design a tailored mix of services around your current stack
                            and growth goals.
                        </p>
                    </div>
                    <Link
                        href={hero.primaryCta?.href || "/contact"}
                        target={hero.primaryCta?.target || "_self"}
                        className="inline-flex items-center text-sm font-semibold text-white hover:text-[#0A84FF] transition-colors"
                    >
                        Book a discovery call →
                    </Link>
                </div>
            </section>
        </main>
    );
}
