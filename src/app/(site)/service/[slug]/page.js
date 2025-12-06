import Link from "next/link";
import { notFound } from "next/navigation";
import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICE_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";

export const revalidate = 300;

// Map the raw WP data into a clean shape for the UI
async function getServicePageData(slug) {
    const data = await gqlRequest(SERVICE_QUERY, { slug });

    const service = data?.service;
    if (!service) return null;

    const fields = service.serviceFields || {};

    const hero = {
        kicker: fields.kicker || "Service",
        title: service.title || "",
        subtitle: fields.excerpt || "",
        bgDesktop: getAcfImageUrl(service.featuredImage),
        bgMobile: getAcfImageUrl(service.featuredImage),
        iconUrl: getAcfImageUrl(fields.serviceIcon),
    };

    return {
        slug: service.slug,
        hero,
        content: service.content || "",
    };
}

export default async function ServicePage({ params }) {
    const { slug } = await params;

    const data = await getServicePageData(slug);

    if (!data) {
        notFound();
    }

    return <ServiceTemplate service={data} />;
}

// ---------- UI Template (matches category style) ----------

function ServiceTemplate({ service }) {
    const { hero, content } = service;

    return (
        <main className="bg-[#0D1117] text-[#C9D1D9]">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-[#30363D]">
                {/* Background desktop */}
                {hero.bgDesktop && (
                    <div className="hidden md:block absolute inset-0">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${hero.bgDesktop})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0D1117]/80 to-[#0D1117]" />
                    </div>
                )}

                {/* Background mobile */}
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
