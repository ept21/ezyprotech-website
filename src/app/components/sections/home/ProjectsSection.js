"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * NOTE: All comments must stay in English only.
 * Static demo data — replace later with CMS (WPGraphQL) results.
 */
const PROJECTS = [
    {
        title: "Headless Commerce Revamp",
        category: "E-commerce",
        desc: "Migrated to headless stack, improved CVR by 28% and LCP < 1.5s.",
        image: "https://placehold.co/800x600",
        href: "/projects/headless-commerce-revamp",
    },
    {
        title: "AI Funnel Automation",
        category: "Automation",
        desc: "End-to-end AI agents for lead scoring and outreach at scale.",
        image: "https://placehold.co/800x600",
        href: "/projects/ai-funnel-automation",
    },
    {
        title: "B2B SaaS Site Rebuild",
        category: "SaaS",
        desc: "Next.js + WP headless with modular CMS blocks and AEO.",
        image: "https://placehold.co/800x600",
        href: "/projects/b2b-saas-rebuild",
    },
    {
        title: "Analytics & Attribution",
        category: "Data",
        desc: "Unified events model, MMM inputs, and multi-touch attribution.",
        image: "https://placehold.co/800x600",
        href: "/projects/analytics-attribution",
    },
];

export default function ProjectsSection() {
    return (
        <section id="projects" className="v-sec v-sec--scheme-2">
            <div className="v-sec__container">
                {/* Section header */}
                <header className="v-head v-head--center">
                    <p className="v-kicker v-kicker--light">Deliver</p>
                    <h2 className="v-title-xl">Featured projects</h2>
                    <p className="v-sub">
                        A snapshot of recent work — fast, scalable, and designed for growth.
                    </p>
                </header>

                {/* Grid */}
                <div className="v-grid-projects v-grid-projects--xl4">
                    {PROJECTS.map((p) => (
                        <article key={p.href} className="v-project">
                            {/* Background image */}
                            <Image
                                src={p.image}
                                alt={p.title}
                                width={1200}
                                height={900}
                                className="v-project__img"
                                priority={false}
                            />

                            {/* Content overlay */}
                            <div className="v-project__content">
                                <span className="v-badge">{p.category}</span>
                                <h3 className="v-project__title">{p.title}</h3>
                                <p className="v-project__desc">{p.desc}</p>

                                <div className="v-project__actions">
                                    <Link href={p.href} className="btn-pill" aria-label={`View project: ${p.title}`}>
                                        View project
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Section CTA */}
                <div className="v-actions">
                    <Link href="/projects" className="btn-brand" aria-label="See all projects">
                        See all projects
                    </Link>
                </div>
            </div>
        </section>
    );
}
