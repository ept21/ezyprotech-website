// src/components/layout/Footer.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";

/**
 * NOTE: All comments must remain in English only.
 * Footer renders:
 *  - Brand (logo + short blurb)
 *  - Links from WP FOOTER menu (flat list, auto-sliced to 2–3 columns)
 *  - Social links from globals (optional)
 */

function normalizeUrl(url = "") {
    try {
        const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
        const u = new URL(url, base);
        // Internal links → use relative path
        return u.origin === base ? (u.pathname + (u.search || "") + (u.hash || "")) : url;
    } catch {
        return url || "#";
    }
}

// Slice a flat list into N columns with similar length
function toColumns(items = [], cols = 3) {
    if (!items.length) return Array.from({ length: cols }, () => []);
    const per = Math.ceil(items.length / cols);
    return Array.from({ length: cols }, (_, i) => items.slice(i * per, (i + 1) * per));
}

export default function Footer({
                                   // from layout
                                   links = [],                    // [{id,label,url}]
                                   siteTitle = "Veltiqo",
                                   sitelogo,
                                   // socials from globals (all optional)
                                   socials = {
                                       facebook: null,
                                       instagram: null,
                                       tiktok: null,
                                       linkedin: null,
                                       x: null,
                                       youtube: null, // just in case in future
                                   },
                               }) {
    const year = new Date().getFullYear();

    const flatLinks = (links || []).map((n) => ({
        id: n.id ?? String(n.url),
        label: n.label ?? "",
        url: normalizeUrl(n.url ?? "#"),
    }));

    // 2–3 columns depending on link count
    const colCount = flatLinks.length <= 10 ? 2 : 3;
    const columns = toColumns(flatLinks, colCount);

    const SOCIAL_ICONS = [
        { key: "facebook", label: "Facebook", Icon: Facebook },
        { key: "instagram", label: "Instagram", Icon: Instagram },
        { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
        { key: "x", label: "X (Twitter)", Icon: Twitter },
        { key: "tiktok", label: "TikTok", Icon: Youtube }, // placeholder icon; replace if you add a TikTok SVG
    ];

    const hasAnySocial = SOCIAL_ICONS.some(({ key }) => socials?.[key]);

    return (
        <footer
            className="
        mt-20 border-t border-[var(--border-subtle)]
        bg-[color-mix(in_oklab,var(--bg-elevated)_85%,transparent)]
        backdrop-blur-md mt-[-4px]
      "
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">Website footer</h2>

            {/* Top: brand + socials + link columns */}
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    {/* Brand block */}
                    <div className="max-w-md">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring ring-[var(--brand-primary)] rounded-lg"
                            aria-label={`${siteTitle} home`}
                        >
                            {sitelogo ? (
                                <Image
                                    src={sitelogo}
                                    alt={siteTitle}
                                    width={140}
                                    height={28}
                                    className="h-7 w-25"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/veltiqo-logo.webp"
                                    alt={siteTitle}
                                    width={140}
                                    height={28}
                                    className="h-8 w-25"
                                    priority
                                />
                            )}
                        </Link>

                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                            AI-driven web & growth systems. We design and ship headless websites,
                            automations, and marketing ops that move the needle.
                        </p>

                        {/* Socials (optional) */}
                        {hasAnySocial && (
                            <ul className="mt-4 flex justify-center" aria-label="Social media">
                                {SOCIAL_ICONS.map(({key, label, Icon}) => {
                                    const href = socials?.[key]?.url || socials?.[key];
                                    if (!href) return null;
                                    return (
                                        <li key={key} className="mr-2">
                                            <Link
                                                href={href}
                                                aria-label={label}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)]
                                   text-[var(--text-secondary)] hover:text-[var(--foreground)]
                                   hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring ring-[var(--brand-primary)]"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Icon className="h-5 w-5"/>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}


                    </div>


                    {/* Link columns from FOOTER menu */}
                    <div className={`grid gap-8 grid-cols-2 sm:grid-cols-${colCount}`}>
                        {columns.map((col, idx) => (
                            <nav key={`col-${idx}`} aria-label={`Footer links ${idx + 1}`}>
                                <ul className="space-y-2">
                                    {col.map((l) => (
                                        <li key={l.id}>
                                            <Link
                                                href={l.url}
                                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)]
                                   focus:outline-none focus-visible:ring ring-[var(--brand-primary)] rounded"
                                            >
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[var(--border-subtle)]">
                <div
                    className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-[var(--text-secondary)]">
                        © {year} {siteTitle}. All rights reserved.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/privacy" className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
