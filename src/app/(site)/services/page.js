// app/(site)/services/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICES_PAGE_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";
import ServicesExplorer from "@/app/components/services/ServicesExplorer";

export const revalidate = 300;

const SERVICES_PAGE_URI = "/services/";

// Frontend base URL for schema
const FRONTEND_BASE_URL =
    (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://veltiqo.com").replace(
        /\/+$/,
        ""
    );

/* ---------------- Helpers ---------------- */

// Decode basic HTML entities for short text fields
function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
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
 * Generate Authority Schema JSON-LD for the Services overview page.
 * Uses the AuthoritySchema ACF group on the page (if filled).
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
    const url = `${baseUrl}/services/`;

    const fields = page.servicesPageFields || page.servicespageFields || {};

    const title =
        fields.servicestitle ||
        page.title ||
        "Services – Veltiqo";

    const description =
        seo?.metaDesc ||
        aiSummary ||
        decodeHtmlEntities(
            fields.servicesshortdescription || page.excerpt || ""
        ) ||
        "Explore Veltiqo services for AI-driven growth, automation, and web systems.";

    const featuredImageUrl =
        getAcfImageUrl(fields.servicesimage) ||
        getAcfImageUrl(page.featuredImage) ||
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
            name: `${title} – Services overview`,
        };
    }

    return JSON.stringify(schema);
}

/* ---------------- Data fetch ---------------- */

async function getServicesPageData() {
    const data = await gqlRequest(SERVICES_PAGE_QUERY, {
        slug: SERVICES_PAGE_URI,
        first: 100,
    });

    if (!data?.page) return null;

    return {
        page: data.page,
        services: data.services?.nodes || [],
    };
}

/* ---------------- Metadata (Yoast only) ---------------- */

export async function generateMetadata() {
    const servicesRes = await gqlRequest(SERVICES_PAGE_QUERY, {
        slug: SERVICES_PAGE_URI,
        first: 1,
    });

    const page = servicesRes?.page || null;

    if (!page) {
        return {
            title: "Services – Veltiqo",
            description:
                "Explore Veltiqo services for AI-driven growth, automation, and web systems.",
        };
    }

    const fields = page.servicesPageFields || page.servicespageFields || {};
    const fallbackImage = page.featuredImage?.node || null;

    const baseMeta = yoastToMetadata({
        wpSeo: page.seo,
        fallbackTitle: fields.servicestitle || page.title || "Services – Veltiqo",
        fallbackDescription:
            fields.servicesshortdescription ||
            decodeHtmlEntities(
                (page.excerpt || "").slice(0, 180) ||
                "Explore Veltiqo services for AI-driven growth, automation, and web systems."
            ),
        fallbackImage,
    });

    // No seoEnhancements here: internal-only, not exposed as meta.
    return {
        ...baseMeta,
    };
}

/* ---------------- UI mapping ---------------- */

function mapToUi(page, servicesNodes) {
    const fields = page.servicesPageFields || page.servicespageFields || {};

    const hero = {
        kicker: fields.kicker || "Services",
        title: fields.servicestitle || page.title || "Services",
        subtitle: decodeHtmlEntities(fields.servicessubtitle || ""),
        shortDescription: decodeHtmlEntities(fields.servicesshortdescription || ""),
        bgDesktop: getAcfImageUrl(fields.servicesherobgimage) || null,
        bgMobile:
            getAcfImageUrl(fields.servicesheromobilebgimage) ||
            getAcfImageUrl(fields.servicesherobgimage) ||
            null,
        heroImage:
            getAcfImageUrl(fields.servicesimage) ||
            getAcfImageUrl(page.featuredImage) ||
            null,
        primaryCta: mapAcfLink(fields.ctaurl1, "/contact"),
        secondaryCta: mapAcfLink(fields.ctaurl2, "/contact"),
    };

    const contentHtml = fields.servicescontent || page.content || "";

    const services = servicesNodes.map((s) => {
        const sf = s.serviceFields || {};
        const categories = (s.serviceCategories?.nodes || []).map((cat) => ({
            name: cat.name,
            slug: cat.slug,
        }));

        return {
            slug: s.slug,
            title: s.title,
            excerpt: decodeHtmlEntities(sf.excerpt || ""),
            kicker: sf.kicker || "",
            iconUrl: getAcfImageUrl(sf.serviceIcon) || null,
            featuredUrl: getAcfImageUrl(s.featuredImage) || null,
            categories,
        };
    });

    return {
        hero,
        contentHtml,
        services,
    };
}

/* ---------------- Page component ---------------- */

export default async function ServicesPage() {
    const data = await getServicesPageData();
    if (!data) {
        notFound();
    }

    const ui = mapToUi(data.page, data.services);
    const authoritySchemaJson = generateAuthoritySchemaJsonForPage(data.page);

    return <ServicesTemplate {...ui} authoritySchemaJson={authoritySchemaJson} />;
}

/* ---------------- UI Template ---------------- */

function ServicesTemplate({ hero, contentHtml, services, authoritySchemaJson }) {
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
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] items-center">
                        {/* Left column: text */}
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

                        {/* Right column: hero image card */}
                        {hero.heroImage && (
                            <div className="max-w-md w-full ml-auto">
                                <div className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                    <div className="relative w-full pt-[62%]">
                                        <img
                                            src={hero.heroImage}
                                            alt={hero.title || "Services visual"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-transparent to-transparent" />
                                    </div>
                                    <div className="px-5 py-4 border-t border-[#30363D] bg-[#161B22]/95">
                                        <p className="text-xs text-[#8B949E]">
                                            Overview of Veltiqo&apos;s AI-driven services stack.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Page content (servicescontent / content) */}
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

            {/* Services grid + filter */}
            <section className="max-w-[1440px] mx-auto px-6 pb-16 md:pb-20">
                <ServicesExplorer services={services} />
            </section>

            {/* Bottom CTA */}
            <section className="max-w-[1440px] mx-auto px-6 pb-10">
                <div className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Not sure which services to start with?
                        </h2>
                        <p className="text-xs md:text-sm text-[#8B949E] mt-1">
                            We can map your stack, find the gaps, and recommend the exact
                            combination of services for maximum impact.
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
