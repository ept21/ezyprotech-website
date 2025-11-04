"use client";

import * as React from "react";
import { Cpu, Rocket, ShieldCheck, LineChart, Zap, Cog, Sparkles } from "lucide-react";

const ICONS = { Cpu, Rocket, ShieldCheck, LineChart, Zap, Cog, Sparkles };
const getIcon = (name) => ICONS[name] || Sparkles;

export default function ServicesSection({ eyebrow, title, subtitle, items = [] }) {
    return (
        <section id="services" aria-labelledby="services-heading" className="section">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">
                    {eyebrow && (
                        <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                            {eyebrow}
                        </p>
                    )}
                    <h2
                        id="services-heading"
                        className="mt-2 text-3xl md:text-4xl font-extrabold tracking-[-0.01em]"
                    >
                        {title || "Our Services"}
                    </h2>
                    {subtitle && (
                        <p className="mt-3 text-base md:text-lg text-[var(--text-secondary)]">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Cards Grid */}
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, i) => {
                        const Icon = getIcon(item.icon);
                        return (
                            <article
                                key={i}
                                className="glass-card h-full p-6 md:p-7 bg-[color-mix(in_oklab,var(--bg-elevated)_85%,transparent)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="neon-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                        aria-hidden="true"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold tracking-[-0.01em]">
                                            {item.title}
                                        </h3>
                                        {item.description && (
                                            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
