"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/** @typedef {{ href: string, label: string, aria?: string }} NavItem */

/** @type {NavItem[]} */
const NAV = [
    { href: "/", label: "Home" },
    { href: "/#services", label: "Services" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    const navBg = scrolled
        ? "backdrop-blur-md bg-[color-mix(in_oklab,var(--bg-default)_70%,transparent)] border-b border-[var(--border-subtle)] py-2"
        : "bg-transparent py-3";

    return (
        <header className={`site-nav transition-all duration-300 ${navBg}`} role="banner">
            <nav className="mx-auto flex items-center justify-between px-4 md:px-6 max-w-7xl" aria-label="Primary">
                {/* לוגו */}
                <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring ring-[var(--brand-primary)] rounded-lg">
                    <Image
                        src="/logo-veitiqo-light.svg"
                        alt="Veitiqo"
                        width={140}
                        height={28}
                        className="block dark:hidden h-7 w-25"
                        priority
                    />
                    <Image
                        src="/logo-veitiqo-dark.svg"
                        alt="Veitiqo"
                        width={1400}
                        height={28}
                        className="hidden dark:block h-7 w-25"
                        priority
                    />
                </Link>

                {/* דסקטופ */}
                <ul className="hidden md:flex items-center gap-1">
                    {NAV.map((item) => {
                        const active =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname === item.href || (item.href.startsWith("/#") && pathname === "/");
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-label={item.aria || item.label}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition
                    ${active ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"}
                    focus:outline-none focus-visible:ring ring-[var(--brand-primary)]`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <Link href="/contact" className="ml-1 btn-brand" aria-label="Get in touch">
                            Get in touch
                        </Link>
                    </li>
                </ul>

                {/* מובייל: כפתור תפריט */}
                <button
                    type="button"
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 focus:outline-none focus-visible:ring ring-[var(--brand-primary)]"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {/* מובייל: מגירה */}
            <div
                id="mobile-menu"
                className={`md:hidden transition-[max-height,opacity] duration-300 overflow-hidden
        ${open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}
            >
                <div className="mx-4 mt-2 rounded-2xl border border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--bg-elevated)_85%,transparent)] backdrop-blur-md p-2 glass-card">
                    <ul className="flex flex-col">
                        {NAV.map((item) => {
                            const active =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname === item.href || (item.href.startsWith("/#") && pathname === "/");
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`block w-full px-4 py-3 rounded-xl text-base transition
                      ${active ? "text-[var(--brand-primary)] bg-[color-mix(in_oklab,var(--brand-primary)_8%,transparent)]" : "text-[var(--foreground)] hover:bg-[rgba(255,255,255,.04)]"}
                      focus:outline-none focus-visible:ring ring-[var(--brand-primary)]`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                        <li className="px-2 pt-2 pb-1">
                            <Link href="/contact" className="btn-brand w-full">
                                Get in touch
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
