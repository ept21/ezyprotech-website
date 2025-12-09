// app/service/[slug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICE_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

// Frontend base URL for schema (can be overridden via env)
const FRONTEND_BASE_URL =
    (process.env.NEXT_PUBLIC_FRONTEND_URL || "https://veltiqo.com").replace(
        /\/+$/,
        ""
    );

/* ---------------- Helpers ---------------- */

// Handle both object and Promise for params (Next 16 behavior)
async function resolveParams(params) {
    if (!params) return {};
    if (typeof params.then === "function") {
        return await params;
    }
    return params;
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

// Decode basic HTML entities for short text fields (like excerpt)
function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
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
 * Generate Authority Schema JSON-LD for a single service.
 * Uses the AuthoritySchema ACF group on the service (if filled).
 * No seoEnhancements are involved here.
 */
function generateAuthoritySchemaJsonForService(service) {
    const authority = service?.authoritySchema || null;
    const seo = service?.seo || null;

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
    const url = `${baseUrl}/service/${service.slug}`;

    const fields = service.serviceFields || {};

    const title =
        (fields.title && fields.title.trim()) ||
        service.title ||
        "Veltiqo Service";

    const description =
        seo?.metaDesc ||
        aiSummary ||
        decodeHtmlEntities(fields.excerpt || "") ||
        "AI-powered service from Veltiqo for modern growth, automation, and web systems.";

    const featuredImageUrl =
        getAcfImageUrl(fields.herobg) ||
        getAcfImageUrl(service.featuredImage) ||
        null;

    const schema = {
        "@context": "https://schema.org",
        "@type": schemaType || "Service",
        name: title,
        description,
        url,
        image: featuredImageUrl || undefined,
        abstract: aiSummary || undefined,
        serviceType: primaryEntity || undefined,
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
            name: `${title} – Service deep dive`,
        };
    }

    return JSON.stringify(schema);
}

/* ---------------- Data fetch ---------------- */

async function getRawService(slug) {
    if (!slug) {
        console.warn("[Service] Missing slug param in getRawService");
        return null;
    }

    const data = await gqlRequest(SERVICE_QUERY, { slug });
    return data?.service || null;
}

/* ---------------- Metadata (Yoast only) ---------------- */

export async function generateMetadata({ params }) {
    const resolved = await resolveParams(params);
    const slug = resolved.slug;

    if (!slug) {
        return {
            title: "Service – Veltiqo",
            description:
                "Veltiqo services for AI-driven growth, automation, and web systems.",
        };
    }

    const serviceRes = await gqlRequest(SERVICE_QUERY, { slug });
    const service = serviceRes?.service || null;

    if (!service) {
        return {
            title: "Service not found – Veltiqo",
            description: "Requested service was not found.",
        };
    }

    const wpSeo = service.seo;
    const fields = service.serviceFields || {};
    const fallbackImage = service.featuredImage?.node || null;

    const baseMeta = yoastToMetadata({
        wpSeo,
        fallbackTitle: fields.title || service.title,
        fallbackDescription: decodeHtmlEntities(fields.excerpt || ""),
        fallbackImage,
    });

    // No seoEnhancements in metadata (internal-only).
    // No ai:* meta attributes. Only Yoast + fallbacks.

    return {
        ...baseMeta,
    };
}

/* ---------------- UI mapping ---------------- */

function mapServiceToUi(service) {
    const fields = service.serviceFields || {};

    const kicker = fields.kicker || "Service";
    const title = (fields.title && fields.title.trim()) || service.title || "";
    const subtitle = decodeHtmlEntities(fields.excerpt || "");

    // Hero background: only from herobg / mobileherobg, not from featured image
    const bgDesktop = getAcfImageUrl(fields.herobg) || null;
    const bgMobile =
        getAcfImageUrl(fields.mobileherobg) ||
        getAcfImageUrl(fields.herobg) ||
        null;

    const iconUrl = getAcfImageUrl(fields.serviceIcon) || null;

    const featuredNode = service.featuredImage?.node || null;
    const featuredUrl = getAcfImageUrl(service.featuredImage) || null;
    const featuredAlt =
        featuredNode?.altText || `${title || "Service visual"} illustration`;

    const primaryCta = mapAcfLink(fields.ctaurl1, "/contact");
    const secondaryCta = mapAcfLink(fields.ctaurl2, "/contact");

    const contentHtml = fields.content || service.content || "";

    return {
        slug: service.slug,
        hero: {
            kicker,
            title,
            subtitle,
            bgDesktop,
            bgMobile,
            iconUrl,
            featuredUrl,
            featuredAlt,
            primaryCta,
            secondaryCta,
        },
        content: contentHtml,
    };
}

/* ---------------- Page component ---------------- */

export default async function ServicePage({ params }) {
    const resolved = await resolveParams(params);
    const slug = resolved.slug;

    if (!slug) {
        notFound();
    }

    const raw = await getRawService(slug);
    if (!raw) {
        notFound();
    }

    const authoritySchemaJson = generateAuthoritySchemaJsonForService(raw);
    const data = mapServiceToUi(raw);

    return (
        <ServiceTemplate
            service={data}
            authoritySchemaJson={authoritySchemaJson}
        />
    );
}

/* ---------------- UI Template ---------------- */

function ServiceTemplate({ service, authoritySchemaJson }) {
    const { hero, content } = service;

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
                        {/* Left column: text + CTAs */}
                        <div className="max-w-3xl">
                            {(hero.iconUrl || hero.kicker) && (
                                <div className="mt-2 flex items-center gap-3">
                                    {hero.iconUrl && (
                                        <div className="inline-flex h-10 w-10 items-center justify-center">
                                            <img
                                                src={hero.iconUrl}
                                                alt={hero.title || "Service icon"}
                                                className="h-6 w-6 object-contain"
                                            />
                                        </div>
                                    )}

                                    {hero.kicker && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                      {hero.kicker}
                    </span>
                                    )}
                                </div>
                            )}

                            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                {hero.title}
                            </h1>

                            {hero.subtitle && (
                                <p className="mt-4 text-base md:text-lg text-[#8B949E] max-w-2xl">
                                    {hero.subtitle}
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

                        {/* Right column: featured visual card */}
                        {(hero.featuredUrl || hero.iconUrl) && (
                            <div className="max-w-md w-full ml-auto">
                                <div className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                    {hero.featuredUrl ? (
                                        <div className="relative w-full pt-[62%]">
                                            <img
                                                src={hero.featuredUrl}
                                                alt={hero.featuredAlt}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-transparent to-transparent" />
                                            {hero.iconUrl && (
                                                <div className="absolute top-4 left-4 h-10 w-10 rounded-2xl bg-[#0D1117]/85 border border-[#00C293]/50 flex items-center justify-center shadow-[0_0_14px_rgba(0,194,147,0.45)]">
                                                    <img
                                                        src={hero.iconUrl}
                                                        alt="Service icon"
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center py-10 bg-[#0D1117]">
                                            {hero.iconUrl && (
                                                <img
                                                    src={hero.iconUrl}
                                                    alt="Service icon"
                                                    className="h-16 w-16 object-contain"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="px-5 py-4 border-t border-[#30363D] bg-[#161B22]/95">
                                        <p className="text-xs text-[#8B949E]">
                                            Visual representation of this service in your stack.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Content section */}
            <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-10">
                    {/* Main content */}
                    <article className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
                        {content ? (
                            <div
                                className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white prose-li:text-[#C9D1D9]"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        ) : (
                            <p className="text-[#8B949E] text-sm">
                                Content for this service will be added soon.
                            </p>
                        )}
                    </article>

                    {/* Side panel / CTA */}
                    <aside className="space-y-6">
                        <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
                            <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                                Ready to implement this?
                            </h2>
                            <p className="text-xs md:text-sm text-[#8B949E] mb-4">
                                We can scope, design, and ship this service as part of a full
                                growth or automation plan tailored to your business.
                            </p>
                            <Link
                                href={hero.primaryCta?.href || "/contact"}
                                target={hero.primaryCta?.target || "_self"}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold bg-[#0A84FF] hover:bg-[#0070E0] text-white text-sm shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] transition-all"
                            >
                                {hero.primaryCta?.label || "Talk to our team"}
                            </Link>
                        </div>

                        <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6">
                            <h3 className="text-sm font-semibold text-white mb-2">
                                Explore more services
                            </h3>
                            <p className="text-xs text-[#8B949E] mb-3">
                                Browse related solutions across automation, web, and growth
                                systems.
                            </p>
                            <Link
                                href="/services"
                                className="inline-flex items-center text-xs font-semibold text-white hover:text-[#00C293] transition-colors"
                            >
                                Back to all services →
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>

            {/* Bottom narrow CTA */}
            <section className="max-w-[1440px] mx-auto px-6 pb-10">
                <div className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-white">
                            Not sure if this is the right fit?
                        </h2>
                        <p className="text-xs md:text-sm text-[#8B949E] mt-1">
                            We can audit your current stack and recommend the exact mix of
                            services that will move the needle.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className="inline-flex items-center text-sm font-semibold text-white hover:text-[#0A84FF] transition-colors"
                    >
                        Book a discovery call →
                    </Link>
                </div>
            </section>
        </main>
    );
}
