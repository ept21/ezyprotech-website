// app/service/[slug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICE_QUERY, GLOBALS_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

/* ---------------- SEO helpers ---------------- */

// Merge SEO enhancements with override-or-fallback semantics
// - Page-level overrides globals when it has values
// - Otherwise we fall back to global values
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

// Handle both object and Promise for params (Next 16 behavior)
async function resolveParams(params) {
    if (!params) return {};
    if (typeof params.then === "function") {
        return await params;
    }
    return params;
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

/* ---------------- Metadata (Yoast + ACF seoEnhancements) ---------------- */

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

    const [globalsRes, serviceRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(SERVICE_QUERY, { slug }),
    ]);

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

    // Base metadata from Yoast
    const baseMeta = yoastToMetadata({
        wpSeo,
        fallbackTitle: service.title,
        fallbackDescription: fields.excerpt || "",
        fallbackImage,
    });

    // Merge SEO enhancements (page + global)
    const pageSeoEnhancements = service.seoEnhancements || null;
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

    // Optional: use seoKeywords also as classic <meta name="keywords">
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

function mapServiceToUi(service) {
    const fields = service.serviceFields || {};

    const featuredNode = service.featuredImage?.node || null;

    const hero = {
        kicker: fields.kicker || "Service",
        title: service.title || "",
        subtitle: fields.excerpt || "",
        // Note: getAcfImageUrl expects an object with node or ACF image field
        bgDesktop: getAcfImageUrl(service.featuredImage) || null,
        bgMobile: getAcfImageUrl(service.featuredImage) || null,
        iconUrl: getAcfImageUrl(fields.serviceIcon),
        featuredNode,
    };

    return {
        slug: service.slug,
        hero,
        content: service.content || "",
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

    const data = mapServiceToUi(raw);

    return <ServiceTemplate service={data} />;
}

/* ---------------- UI Template ---------------- */

function ServiceTemplate({ service }) {
    const { hero, content } = service;

    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
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
                    </div>
                </div>
            </section>

            {/* Content section */}
            <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-10">
                    {/* Main content */}
                    <article className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8">
                        {content ? (
                            <div
                                className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#C9D1D9] prose-a:text-[#0A84FF] prose-strong:text-white"
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
                        <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-6">
                            <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                                Ready to implement this?
                            </h2>
                            <p className="text-xs md:text-sm text-[#8B949E] mb-4">
                                We can scope, design, and ship this service as part of a full
                                growth or automation plan tailored to your business.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl font-semibold bg-[#0A84FF] hover:bg-[#0070E0] text-white text-sm shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] transition-all"
                            >
                                Talk to our team
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
                <div className="py-6 px-6 md:px-10 rounded-2xl bg-[#161B22]/60 border border-[#30363D] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
