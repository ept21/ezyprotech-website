"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// ServicesExplorer handles category filtering + services grid UI
export default function ServicesExplorer({ services = [] }) {
    // Build unique category list from services
    const categories = useMemo(() => {
        const map = new Map();

        (services || []).forEach((s) => {
            (s.categories || []).forEach((cat) => {
                if (!cat?.slug || !cat?.name) return;
                if (!map.has(cat.slug)) {
                    map.set(cat.slug, cat.name);
                }
            });
        });

        return Array.from(map, ([slug, name]) => ({ slug, name }));
    }, [services]);

    const [activeCategory, setActiveCategory] = useState("all");

    const filteredServices = useMemo(() => {
        if (activeCategory === "all") return services;
        return (services || []).filter((s) =>
            (s.categories || []).some((cat) => cat.slug === activeCategory)
        );
    }, [services, activeCategory]);

    const totalCount = services.length;
    const filteredCount = filteredServices.length;

    return (
        <>
            {/* Heading + helper text */}
            <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between mb-4 md:mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">
                        All services
                    </h2>
                    <p className="text-xs md:text-sm text-[#8B949E]">
                        Browse Veltiqo services by capability and layer in your stack.
                    </p>
                </div>
                <div className="text-[11px] md:text-xs text-[#8B949E] mt-1 md:mt-0">
                    Showing{" "}
                    <span className="text-[#C9D1D9] font-semibold">
            {filteredCount}
          </span>{" "}
                    of{" "}
                    <span className="text-[#C9D1D9] font-semibold">
            {totalCount}
          </span>{" "}
                    services
                </div>
            </div>

            {/* Filter bar */}
            {categories.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveCategory("all")}
                        className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all border
              ${
                            activeCategory === "all"
                                ? "bg-[#0A84FF] border-[#0A84FF] text-white shadow-[0_0_16px_rgba(10,132,255,0.6)]"
                                : "bg-[#0D1117]/70 border-[#30363D] text-[#C9D1D9] hover:border-[#0A84FF]/70 hover:text-white"
                        }`}
                    >
                        All
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            type="button"
                            onClick={() => setActiveCategory(cat.slug)}
                            className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all border
                ${
                                activeCategory === cat.slug
                                    ? "bg-[#00C293] border-[#00C293] text-[#0D1117] shadow-[0_0_16px_rgba(0,194,147,0.65)]"
                                    : "bg-[#0D1117]/70 border-[#30363D] text-[#C9D1D9] hover:border-[#00C293]/70 hover:text-[#00C293]"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Services grid */}
            {filteredServices.length === 0 ? (
                <p className="text-[#8B949E] text-sm mt-4">
                    No services match this filter yet.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map((service) => (
                        <article
                            key={service.slug}
                            className="group bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden flex flex-col h-full hover:border-[#00C293]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00C293]/5"
                        >
                            {/* Top visual */}
                            <div className="h-40 bg-[#0D1117] relative overflow-hidden">
                                {service.featuredUrl && (
                                    <img
                                        src={service.featuredUrl}
                                        alt={service.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/85 via-transparent to-transparent" />
                                {service.kicker && (
                                    <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase border border-[#0A84FF]/40 bg-[#0A84FF]/10 text-[#0A84FF]">
                      {service.kicker}
                    </span>
                                    </div>
                                )}
                                {service.iconUrl && (
                                    <div className="absolute bottom-4 right-4 h-10 w-10 rounded-2xl bg-[#0D1117]/85 border border-[#00C293]/70 flex items-center justify-center shadow-[0_0_16px_rgba(0,194,147,0.6)]">
                                        <img
                                            src={service.iconUrl}
                                            alt={`${service.title} icon`}
                                            className="h-6 w-6 object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Body */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-[#00C293] transition-colors">
                                    {service.title}
                                </h3>

                                {service.categories?.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {service.categories.map((cat) => (
                                            <span
                                                key={cat.slug}
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wide border border-[#30363D] text-[#8B949E] bg-[#0D1117]/40"
                                            >
                        {cat.name}
                      </span>
                                        ))}
                                    </div>
                                )}

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
            )}
        </>
    );
}
