// app/(site)/service-category/[slug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import {
    SERVICE_CATEGORY_PAGE_QUERY,
    SERVICE_CATEGORY_SLUGS_QUERY,
} from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

// Frontend base URL for schema
const FRONTEND_BASE_URL =
    (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://veltiqo.com").replace(
        /\/+$/,
        ""
    );

/* ---------------- Helpers ---------------- */

// Normalize any slug shape (string / array / weird)
function normalizeSlug(rawSlug) {
    if (!rawSlug) return "";
    if (Array.isArray(rawSlug)) {
        return rawSlug[rawSlug.length - 1] || "";
    }
    return String(rawSlug);
}

// Basic HTML entities decoder to avoid showing &amp; etc.
function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return str;
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

// Remove HTML tags & return bullet text array
function extractBulletsFromHtml(html) {
    if (!html || typeof html !== "string") return [];

    return html
        .split("</li>")
        .map((part) =>
            part
                .replace(/<\/?[^>]+(>|$)/g, "")
                .replace(/\s+/g, " ")
                .trim()
        )
        .filter(Boolean);
}

// Normalize ACF link fields
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
 * Generate Authority Schema JSON-LD for a service category (taxonomy page).
 * Uses the AuthoritySchema ACF group on the term (if filled).
 */
function generateAuthoritySchemaJsonForCategory(category) {
    const authority = category?.authoritySchema || null;
    const seo = category?.seo || null;

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
    const url = `${baseUrl}/service-category/${category.slug}`;

    const fields = category.servicesCategory || {};

    const title =
        fields.title ||
        category.name ||
        "Service category – Veltiqo";

    const description =
        seo?.metaDesc ||
        aiSummary ||
        decodeHtmlEntities(fields.subTitle || category.description || "") ||
        "Service category from Veltiqo, grouping related AI, automation, and web services.";

    const featuredImageUrl =
        getAcfImageUrl(fields.serviceCategoryImage) ||
        getAcfImageUrl(fields.herocategorybgimagedesktop) ||
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

    const ratingNumeric = reviewRating ? Number(reviewRating) : 0;
    if (!Number.isNaN(ratingNumeric) && ratingNumeric > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: ratingNumeric.toString(),
            reviewCount: reviewCount ? String(reviewCount) : "1",
        };
    }

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
            name: `${title} – Category overview`,
        };
    }

    return JSON.stringify(schema);
}

/* ---------------- Data fetch ---------------- */

async function getRawServiceCategory(rawSlug) {
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
        console.warn("[ServiceCategory] Missing slug param in getRawServiceCategory");
        return null;
    }

    const data = await gqlRequest(SERVICE_CATEGORY_PAGE_QUERY, { slug });
    return data?.serviceCategory || null;
}

// Map WP data → UI shape (without SEO)
function mapCategoryToUi(category) {
    const fields = category.servicesCategory || {};

    let chips = [];
    if (Array.isArray(fields.bullets)) {
        chips = fields.bullets
            .map((item) => {
                if (!item) return "";
                if (typeof item === "string") return item;
                return item.text || item.label || "";
            })
            .filter(Boolean);
    } else if (typeof fields.bullets === "string") {
        chips = extractBulletsFromHtml(fields.bullets);
    }

    chips = chips.map(decodeHtmlEntities);

    const hero = {
        kicker: fields.kicker || "Solutions category",
        title: fields.title || category.name,
        subtitle: fields.subTitle || category.description || "",
        bgDesktop: getAcfImageUrl(fields.herocategorybgimagedesktop),
        bgMobile:
            getAcfImageUrl(fields.herocategorybgimagemobile) ||
            getAcfImageUrl(fields.herocategorybgimagedesktop),
        chips,
        cta: mapAcfLink(fields.ctaButton, "/contact"),
    };

    const services = (category.services?.nodes || []).map((s) => {
        const serviceFields = s.serviceFields || {};

        const featuredUrl = getAcfImageUrl(s.featuredImage) || null;
        const iconUrl = getAcfImageUrl(serviceFields.serviceIcon) || null;

        return {
            slug: s.slug,
            title: s.title,
            excerpt: serviceFields.excerpt || "",
            kicker: serviceFields.kicker || "",
            iconUrl,
            imageUrl: featuredUrl,
        };
    });

    const contentHtml =
        fields.servicesCategoryContent || category.description || "";

    return {
        slug: category.slug,
        name: category.name,
        hero,
        services,
        contentHtml,
    };
}

/* ---------------- Metadata (Yoast only) ---------------- */

export async function generateMetadata({ params }) {
    const resolved =
        params && typeof params.then === "function" ? await params : params;
    const rawSlug = resolved?.slug;
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
        return {
            title: "Not found – Veltiqo",
            description: "Requested service category was not found.",
        };
    }

    const categoryRes = await gqlRequest(SERVICE_CATEGORY_PAGE_QUERY, { slug });
    const category = categoryRes?.serviceCategory || null;

    if (!category) {
        return {
            title: "Not found – Veltiqo",
            description: "Requested service category was not found.",
        };
    }

    const fields = category.servicesCategory || {};
    const fallbackImage =
        fields.serviceCategoryImage?.node ||
        fields.herocategorybgimagedesktop?.node ||
        null;

    const baseMeta = yoastToMetadata({
        wpSeo: category.seo,
        fallbackTitle: fields.title || category.name,
        fallbackDescription:
            decodeHtmlEntities(fields.subTitle || category.description || ""),
        fallbackImage,
    });

    return {
        ...baseMeta,
    };
}

/* ---------------- Static params ---------------- */

export async function generateStaticParams() {
    const data = await gqlRequest(SERVICE_CATEGORY_SLUGS_QUERY, {});
    const nodes = data?.serviceCategories?.nodes || [];

    return nodes
        .filter((node) => node?.slug)
        .map((node) => ({ slug: node.slug }));
}

/* ---------------- Page component ---------------- */

export default async function ServiceCategoryPage({ params }) {
    const resolved =
        params && typeof params.then === "function" ? await params : params;
    const rawSlug = resolved?.slug;

    const rawCategory = await getRawServiceCategory(rawSlug);
    if (!rawCategory) {
        notFound();
    }

    const data = mapCategoryToUi(rawCategory);
    const authoritySchemaJson =
        generateAuthoritySchemaJsonForCategory(rawCategory);

    return (
        <ServiceCategoryTemplate
            category={data}
            authoritySchemaJson={authoritySchemaJson}
        />
    );
}

/* ---------------- UI Template ---------------- */

function ServiceCategoryTemplate({ category, authoritySchemaJson }) {
    const { hero, services, contentHtml } = category;

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
                            <p className="mt-4 text-base md:text-lg text-[#8B949E] max-w-2xl">
                                {hero.subtitle}
                            </p>
                        )}

                        {hero.chips?.length > 0 && (
                            <p className="mt-6 text-xs md:text-sm text-[#8B949E] max-w-2xl">
                                <span className="font-medium text-[#C9D1D9]">Includes:</span>{" "}
                                {hero.chips.join(", ")}
                            </p>
                        )}

                        {hero.cta && hero.cta.label && (
                            <div className="mt-8">
                                <Link
                                    href={hero.cta.href}
                                    target={hero.cta.target}
                                    className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold bg-[#0A84FF] text-white hover:bg-[#0070E0]"
                                >
                                    {hero.cta.label}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Category rich content */}
            {contentHtml && (
                <section className="max-w-[1440px] mx-auto px-6 pt-4 md:pt-8">
                    <article className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8">
                        <div
                            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </article>
                </section>
            )}

            {/* Services grid */}
            <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <article
                            key={service.slug}
                            className="group relative bg-[#0D1117] border border-[#30363D] rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-[#0A84FF] hover:shadow-[0_0_28px_rgba(10,132,255,0.45)]"
                        >
                            <div className="h-40 relative overflow-hidden">
                                {service.imageUrl && (
                                    <div className="absolute inset-0">
                                        <div
                                            className="w-full h-full bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-500"
                                            style={{ backgroundImage: `url(${service.imageUrl})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#0D1117]/65 to-[#0D1117]" />
                                    </div>
                                )}

                                {!service.imageUrl && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0A84FF]/20 via-[#00C293]/10 to-[#0D1117]" />
                                )}

                                {service.iconUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img
                                            src={service.iconUrl}
                                            alt={service.title}
                                            className="max-h-20 max-w-[70%] object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_16px_rgba(0,194,255,0.45)]"
                                        />
                                    </div>
                                )}

                                {service.kicker && (
                                    <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                      {service.kicker}
                    </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-[#00C293] transition-colors">
                                    {service.title}
                                </h2>

                                {service.excerpt && (
                                    <p className="text-[#8B949E] text-sm mb-6 flex-grow">
                                        {service.excerpt}
                                    </p>
                                )}

                                <div className="mt-auto">
                                    <Link
                                        href={`/service/${service.slug}`}
                                        className="inline-flex items-center text-sm font-semibold text-white group-hover:text-[#00C293] transition-colors"
                                    >
                                        View details →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Secondary CTA */}
            <section className="max-w-[1440px] mx-auto px-6 pb-10">
                <div className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Not sure where to start?
                        </h2>
                        <p className="text-xs md:text-sm text-[#8B949E] mt-1">
                            Our strategy team can help identify your lowest-hanging fruit.
                        </p>
                    </div>
                    <Link
                        href={hero.cta?.href || "/contact"}
                        target={hero.cta?.target || "_self"}
                        className="inline-flex items-center text-sm font-semibold text-white hover:text-[#0A84FF] transition-colors"
                    >
                        Book a discovery call →
                    </Link>
                </div>
            </section>
        </main>
    );
}
