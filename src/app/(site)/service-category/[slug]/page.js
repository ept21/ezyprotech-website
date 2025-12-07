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

/* ---------------- Helpers ---------------- */

// Normalize any slug shape (string / array / weird)
function normalizeSlug(rawSlug) {
    if (!rawSlug) return "";
    if (Array.isArray(rawSlug)) {
        return rawSlug[rawSlug.length - 1] || "";
    }
    return String(rawSlug);
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
        return {
            slug: s.slug,
            title: s.title,
            excerpt: serviceFields.excerpt || "",
            kicker: serviceFields.kicker || "",
            iconUrl: getAcfImageUrl(serviceFields.serviceIcon),
        };
    });

    return {
        slug: category.slug,
        name: category.name,
        hero,
        services,
    };
}

/* ---------------- Metadata (Yoast) ---------------- */

export async function generateMetadata({ params }) {
    // In Next 16 params is a Promise
    const { slug: rawSlug } = await params;
    const category = await getRawServiceCategory(rawSlug);

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

    return yoastToMetadata({
        wpSeo: category.seo,
        fallbackTitle: fields.title || category.name,
        fallbackDescription: fields.subTitle || category.description || "",
        fallbackImage,
    });
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
    // params is a Promise in Next 16 – must await
    const { slug: rawSlug } = await params;

    const rawCategory = await getRawServiceCategory(rawSlug);
    if (!rawCategory) {
        notFound();
    }

    const data = mapCategoryToUi(rawCategory);

    return <ServiceCategoryTemplate category={data} />;
}

/* ---------------- UI Template ---------------- */

function ServiceCategoryTemplate({ category }) {
    const { hero, services } = category;

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

                        {/* Chips */}
                        {hero.chips?.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full bg-[#C9D1D9] text-[#0D1117] font-semibold text-xs md:text-sm">
                  All services
                </span>

                                {hero.chips.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        className="px-4 py-2 rounded-full border border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#C9D1D9] transition-all text-xs md:text-sm"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
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

            {/* Services grid */}
            <section className="max-w-[1440px] mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <article
                            key={service.slug}
                            className="group bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden flex flex-col h-full hover:border-[#00C293]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00C293]/5"
                        >
                            <div className="h-40 bg-[#0D1117] relative overflow-hidden">
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
                        href={hero.cta.href}
                        target={hero.cta.target}
                        className="inline-flex items-center text-sm font-semibold text-white hover:text-[#0A84FF] transition-colors"
                    >
                        Book a discovery call →
                    </Link>
                </div>
            </section>
        </main>
    );
}
