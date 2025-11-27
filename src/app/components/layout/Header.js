"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * NOTE: All comments must stay in English only.
 * Header renders PRIMARY menu from WP. The "Contact" item (by label or /contact URL)
 * is pulled out and rendered as a CTA button on the right (desktop) and at bottom (mobile).
 */

/** Normalize WP absolute URLs to local-relative Next routes */
function normalizeUrl(url = "") {
    try {
        const u = new URL(url, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
        // If it's our domain or a hash/relative, return pathname+hash
        if (!u.host || u.host === (typeof window !== "undefined" ? window.location.host : "")) {
            return u.pathname + (u.hash || "");
        }
        // External link — keep absolute
        return url;
    } catch {
        return url || "#";
    }
}

/** Decide if item is the Contact CTA (by label or url) */
function isContactItem(label = "", url = "") {
    const l = (label || "").toLowerCase().trim();
    const u = (url || "").toLowerCase();
    return l === "contact" || l === "contact us" || u.includes("/contact");
}

/** Build a flat top-level menu from menu tree (ignore children for now) */
function flattenTop(menu = []) {
    // menu may already be top-level nodes with children. We only need level-1.
    return (menu || [])
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((n) => ({
            id: n.id || String(n.databaseId || Math.random()),
            label: n.label || "",
            url: normalizeUrl(n.url || "#"),
        }));
}

export default function Header({
                                   /** menu: array from layout buildMenuTree() */
                                   menu = [],
                                   /** logo + meta (optional, nice to have) */
                                   sitelogo,
                                   siteTitle = "Veltiqo",
                               }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile on route change
    useEffect(() => setOpen(false), [pathname]);

    // Prepare nav items and CTA from WP menu
    const { navItems, contactCta } = useMemo(() => {
        const flat = flattenTop(menu);
        const contact = flat.find((i) => isContactItem(i.label, i.url)) || null;
        const rest = flat.filter((i) => !isContactItem(i.label, i.url));

        // fallback CTA if none found
        const cta = contact || { label: "Contact", url: "/contact" };
        return { navItems: rest, contactCta: cta };
    }, [menu]);

    const navBg = scrolled
        ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--text-primary)_70%,transparent)] py-2"
        : "bg-transparent py-3";

    const isActive = (href) => {
        try {
            if (!href) return false;
            if (href.startsWith("#")) return pathname === "/";
            const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
            if (url.hash) return pathname === "/";
            return url.pathname === pathname;
        } catch {
            return false;
        }
    };

    return (
        <header className={`site-nav transition-all duration-300 ${navBg}`} role="banner">
            <nav className="mx-auto flex items-center justify-between px-4 md:px-6 max-w-7xl" aria-label="Primary">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-3 focus:outline-none focus-visible:ring ring-[var(--brand-primary)] rounded-lg"
                    aria-label={siteTitle}
                >
                    {sitelogo ? (
                        // CMS logo
                        <Image
                            src={sitelogo}
                            alt={siteTitle}
                            width={140}
                            height={28}
                            className="h-8 w-25"
                            priority
                        />
                    ) : (
                        // Local fallback
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

                {/* Desktop nav */}
                <ul className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={item.url}
                                aria-label={item.label}
                                className={`menu-link px-3 py-2 rounded-lg text-sm font-medium transition
                  ${isActive(item.url)
                                    ? "text-[#ffffff]"
                                    : "text-[var(--text-secondary)] hover:text-[#017373]"}
                  focus:outline-none focus-visible:ring ring-[var(--brand-primary)]`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}

                    {/* CTA (Contact) */}
                    <li>
                        <Link href={contactCta.url} className="ml-1 btn-brand" aria-label={contactCta.label}>
                            {contactCta.label || "Get in touch"}
                        </Link>
                    </li>
                </ul>

                {/* Mobile toggle */}
                <button
                    type="button"
                    className="text-[#2ebdd4] md:hidden inline-flex items-center justify-center rounded-lg p-2 focus:outline-none focus-visible:ring ring-[var(--brand-primary)]"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {/* Mobile drawer */}
            <div
                id="mobile-menu"
                className={`md:hidden transition-[max-height,opacity] duration-300 overflow-hidden
          ${open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
            >
                <div className="mx-4 mt-2 rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--bg-elevated)_85%,transparent)] backdrop-blur-md p-2 glass-card">
                    <ul className="flex flex-col">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.url}
                                    className={`font-bold block w-full px-4 py-3 rounded-xl text-base transition
                    ${isActive(item.url)
                                        ? "text-[var(--brand-primary)] bg-[color-mix(in_oklab,var(--brand-primary)_8%,transparent)]"
                                        : "text-[var(--foreground)] hover:bg-[rgba(255,255,255,.04)]"}
                    focus:outline-none focus-visible:ring ring-[var(--brand-primary)]`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        {/* CTA at bottom */}
                        <li className="px-2 pt-2 pb-1">
                            <Link href={contactCta.url} className="btn-brand w-full" aria-label={contactCta.label}>
                                {contactCta.label || "Get in touch"}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
