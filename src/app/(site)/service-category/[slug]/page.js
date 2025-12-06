// src/app/(site)/service-category/[slug]/page.js
import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import {
    SERVICE_CATEGORY_PAGE_QUERY,
    SERVICE_CATEGORY_SLUGS_QUERY,
} from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";

export const revalidate = 300;

function mapAcfLink(link, fallbackHref = "/contact") {
    if (!link) {
        return { href: fallbackHref, label: "", target: "_self" };
    }

    const href = link.url || fallbackHref;
    const label = link.title || "";
    const target = link.target && link.target !== "" ? link.target : "_self";

    return { href, label, target };
}

async function getServiceCategoryPageData(slug) {
    if (!slug) return null;

    const data = await gqlRequest(SERVICE_CATEGORY_PAGE_QUERY, { slug });
    const category = data?.serviceCategory;
    if (!category) return null;

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
        chips = [fields.bullets];
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

export async function generateStaticParams() {
    const data = await gqlRequest(SERVICE_CATEGORY_SLUGS_QUERY, {});
    const nodes = data?.serviceCategories?.nodes || [];

    return nodes
        .filter((node) => node?.slug)
        .map((node) => ({ slug: node.slug }));
}

export default async function ServiceCategoryPage({ params }) {
    // In Next 16, params can be a Promise and can even be a JSON string.
    const raw = await params;
    const resolvedParams =
        typeof raw === "string" ? JSON.parse(raw) : raw || {};

    const slug = resolvedParams.slug;

    if (!slug) {
        console.log("ServiceCategoryPage: missing slug param", resolvedParams);
        notFound();
    }

    const data = await getServiceCategoryPageData(slug);

    if (!data) {
        console.log("ServiceCategoryPage: no category for slug", slug);
        notFound();
    }

    return <ServiceCategoryTemplate category={data} />;
}

/* ---------------- UI Template ---------------- */

function ServiceCategoryTemplate({ category }) {
    const { hero, services } = category;

    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Hero section */}
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

                        {hero.chips && hero.chips.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full bg-[#C9D1D9] text-[#0D1117] font-semibold text-xs md:text-sm">
                  All services
                </span>
                                {hero.chips.map((chip, idx) => (
                                    <button
                                        key={`${chip}-${idx}`}
                                        type="button"
                                        className="px-4 py-2 rounded-full border border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#C9D1D9] transition-all text-xs md:text-sm"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {hero.cta && hero.cta.href && hero.cta.label && (
                            <div className="mt-8">
                                <Link
                                    href={hero.cta.href}
                                    target={hero.cta.target}
                                    rel={
                                        hero.cta.target === "_blank"
                                            ? "noreferrer noopener"
                                            : undefined
                                    }
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold bg-[#0A84FF] hover:bg-[#0070E0] text-white text-sm md:text-base shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] transition-all"
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
                                <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] to-[#161B22]" />
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle at 2px 2px, #30363D 1px, transparent 0)",
                                        backgroundSize: "20px 20px",
                                    }}
                                />
                                {service.kicker && (
                                    <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                      {service.kicker}
                    </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-lg md:text-xl font-bold text-white mb-3 font-sans group-hover:text-[#00C293] transition-colors">
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
                                        View details<span className="ml-1">→</span>
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
                        href={hero.cta.href || "/contact"}
                        target={hero.cta.target}
                        rel={
                            hero.cta.target === "_blank" ? "noreferrer noopener" : undefined
                        }
                        className="inline-flex items-center text-sm font-semibold text-white hover:text-[#0A84FF] transition-colors"
                    >
                        Book a discovery call<span className="ml-1">→</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}
