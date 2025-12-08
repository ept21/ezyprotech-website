// app/(site)/services/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICES_PAGE_QUERY, GLOBALS_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";
import ServicesExplorer from "@/app/components/services/ServicesExplorer";


export const revalidate = 300;

const SERVICES_PAGE_URI = "/services/";

/* ---------------- SEO helpers ---------------- */

// Merge SEO enhancements with override-or-fallback semantics
function mergeSeoEnhancements(pageSeo, globalSeo) {
    if (!pageSeo && !globalSeo) return null;

    const page = pageSeo || {};
    const global = globalSeo || {};

    const normalizeLines = (value) =>
        (value || "")
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

    const mergeLines = (pageField, globalField) => {
        const pageLines = normalizeLines(pageField);
        if (pageLines.length > 0) {
            return pageLines.join("\n"); // page overrides global
        }
        const globalLines = normalizeLines(globalField);
        return globalLines.join("\n");
    };

    return {
        seoKeywords: mergeLines(page.seoKeywords, global.seoKeywords),
        seoKeyphrases: mergeLines(page.seoKeyphrases, global.seoKeyphrases),
        seoContextTags: mergeLines(page.seoContextTags, global.seoContextTags),
        seoSchemaType: page.seoSchemaType || global.seoSchemaType || "",
        seoFaq: page.seoFaq || global.seoFaq || "",
    };
}

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

/* ---------------- Metadata ---------------- */

export async function generateMetadata() {
    const [globalsRes, servicesRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(SERVICES_PAGE_QUERY, {
            slug: SERVICES_PAGE_URI,
            first: 1,
        }),
    ]);

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

    const pageSeoEnhancements = page.seoEnhancements || null;
    const globalSeoEnhancements = globalsRes?.page?.seoEnhancements || null;
    const mergedSeo = mergeSeoEnhancements(
        pageSeoEnhancements,
        globalSeoEnhancements
    );

    const extraOther =
        mergedSeo && (mergedSeo.seoKeywords || mergedSeo.seoKeyphrases)
            ? {
                "ai:keywords": mergedSeo.seoKeywords || undefined,
                "ai:keyphrases": mergedSeo.seoKeyphrases || undefined,
                "ai:context-tags": mergedSeo.seoContextTags || undefined,
                "ai:schema-type": mergedSeo.seoSchemaType || undefined,
                "ai:faq": mergedSeo.seoFaq || undefined,
            }
            : {};

    const mergedKeywords =
        mergedSeo?.seoKeywords?.length > 0
            ? mergedSeo.seoKeywords
                .split(/\r?\n|,/)
                .map((k) => k.trim())
                .filter(Boolean)
            : baseMeta.keywords;

    return {
        ...baseMeta,
        keywords: mergedKeywords,
        other: {
            ...(baseMeta.other || {}),
            ...extraOther,
        },
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
    return <ServicesTemplate {...ui} />;
}

/* ---------------- UI Template ---------------- */

function ServicesTemplate({ hero, contentHtml, services }) {
    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#30363D]">
                {hero.bgDesktop && (
                    <div className="hidden md:block absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{backgroundImage: `url(${hero.bgDesktop})`}}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0D1117]/80 to-[#0D1117]"/>
                    </div>
                )}

                {hero.bgMobile && (
                    <div className="md:hidden absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{backgroundImage: `url(${hero.bgMobile})`}}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0D1117]/85 to-[#0D1117]"/>
                    </div>
                )}

                <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] items-center">
                        {/* Left column: text */}
                        <div className="max-w-3xl">
                            {hero.kicker && (
                                <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
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
                                <div
                                    className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                    <div className="relative w-full pt-[62%]">
                                        <img
                                            src={hero.heroImage}
                                            alt={hero.title || "Services visual"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-transparent to-transparent"/>
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
                    <article
                        className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8 mb-12 shadow-[0_0_24px_rgba(0,0,0,0.45)]">
                        <div
                            className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white prose-li:text-[#C9D1D9]"
                            dangerouslySetInnerHTML={{__html: contentHtml}}
                        />
                    </article>
                )}
            </section>

            {/* Services grid + filter */}
            <section className="max-w-[1440px] mx-auto px-6 pb-16 md:pb-20">
                <ServicesExplorer services={services}/>
            </section>


            {/* Bottom CTA */}
            <section className="max-w-[1440px] mx-auto px-6 pb-10">
                <div
                    className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_0_26px_rgba(0,0,0,0.4)]">
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
