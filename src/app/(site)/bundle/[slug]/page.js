// app/(site)/bundle/[slug]/page.js

import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { BUNDLE_QUERY, GLOBALS_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

export const revalidate = 300;

/* ---------------- helpers ---------------- */

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
        if (pageLines.length > 0) return pageLines.join("\n");
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

async function resolveParams(params) {
    if (!params) return {};
    if (typeof params.then === "function") {
        return await params;
    }
    return params;
}

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

/* ---------------- Data ---------------- */

async function getRawBundle(slug) {
    if (!slug) return null;
    const data = await gqlRequest(BUNDLE_QUERY, { slug });
    return data?.bundle || null;
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

    const [globalsRes, bundleRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(BUNDLE_QUERY, { slug }),
    ]);

    const bundle = bundleRes?.bundle || null;
    if (!bundle) {
        return {
            title: "Bundle not found – Veltiqo",
            description: "Requested bundle was not found.",
        };
    }

    const fields = bundle.bundlesFields || {};
    const fallbackImage = bundle.featuredImage?.node || null;

    const baseMeta = yoastToMetadata({
        wpSeo: bundle.seo,
        fallbackTitle: fields.title || bundle.title,
        fallbackDescription:
            decodeHtmlEntities(fields.productsIncludes || "") ||
            "AI-powered growth bundle.",
        fallbackImage,
    });

    const pageSeoEnhancements = bundle.seoEnhancements || null;
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

function mapBundleToUi(bundle) {
    const fields = bundle.bundlesFields || {};

    const title =
        (fields.title && fields.title.trim()) || bundle.title || "Bundle";

    const hero = {
        kicker: fields.kicker || "Bundle",
        title,
        subtitle: "",
        price: fields.price || "",
        priceLabel: fields.textNearPriceMonthlyYearlyOrOther || "",
        featuredUrl: getAcfImageUrl(bundle.featuredImage) || null,
        primaryCta: mapAcfLink(fields.ctaurl1, "/contact"),
        secondaryCta: mapAcfLink(fields.ctaurl2, "/contact"),
    };

    const contentHtml = bundle.content || "";
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
    return <BundleTemplate bundle={data} />;
}

/* ---------------- UI Template ---------------- */

function BundleTemplate({ bundle }) {
    const { hero, contentHtml, includes } = bundle;

    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#30363D]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#00C29322,_transparent_55%),radial-gradient(circle_at_bottom,_#0A84FF22,_transparent_55%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0D1117]/80 to-[#0D1117]" />

                <div className="relative max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)] items-center">
                        {/* Left */}
                        <div className="max-w-3xl">
                            {hero.kicker && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                  {hero.kicker}
                </span>
                            )}

                            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                                {hero.title}
                            </h1>

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

                            {includes && (
                                <div
                                    className="mt-4 text-sm md:text-base text-[#C9D1D9]/85 max-w-2xl
                             space-y-1
                             [&_p]:mb-1
                             [&_ul]:list-disc [&_ul]:pl-5
                             [&_li]:mb-1"
                                    dangerouslySetInnerHTML={{ __html: includes }}
                                />
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

                        {/* Right: visual card */}
                        {hero.featuredUrl && (
                            <div className="max-w-md w-full ml-auto">
                                <div className="relative rounded-3xl border border-[#30363D] bg-[#0D1117]/90 overflow-hidden shadow-[0_0_34px_rgba(10,132,255,0.45)]">
                                    <div className="relative w-full pt-[62%]">
                                        <img
                                            src={hero.featuredUrl}
                                            alt={hero.title || "Bundle visual"}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/80 via-transparent to-transparent" />
                                    </div>
                                    <div className="px-5 py-4 border-t border-[#30363D] bg-[#161B22]/95">
                                        <p className="text-xs text-[#8B949E]">
                                            Visual overview of this Veltiqo bundle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            <h3 className="text-sm font-semibold text-white mb-2">
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
