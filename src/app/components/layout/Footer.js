"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

// קישורים סטטיים כרגע (אפשר להחליף ל-JSON/CMS)
const NAV_GROUPS = [
    {
        title: "Company",
        links: [
            { href: "/#about", label: "About" },
            { href: "/#services", label: "Services" },
            { href: "/#pricing", label: "Pricing" },
            { href: "/contact", label: "Contact" },
        ],
    },
    {
        title: "Resources",
        links: [
            { href: "/#faq", label: "FAQ" },
            { href: "/#testimonials", label: "Testimonials" },
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
        ],
    },
];

const SOCIAL = [
    { href: "https://facebook.com", label: "Facebook", Icon: Facebook },
    { href: "https://instagram.com", label: "Instagram", Icon: Instagram },
    { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
    { href: "https://youtube.com", label: "YouTube", Icon: Youtube },
];

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            className="
        mt-20 border-t border-[var(--border-subtle)]
        bg-[color-mix(in_oklab,var(--bg-elevated)_85%,transparent)]
        backdrop-blur-md
      "
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">Website footer</h2>

            {/* עליון: לוגו + תקציר + סושיאל */}
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    {/* לוגו + תיאור קצר */}
                    <div className="max-w-md">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 focus:outline-none focus-visible:ring ring-[var(--brand-primary)] rounded-lg"
                            aria-label="Veitiqo home"
                        >
                            <Image
                                src="/logo-veitiqo-light.svg"
                                alt="Veitiqo"
                                width={150}
                                height={30}
                                className="block dark:hidden h-8 w-auto"
                                priority
                            />
                            <Image
                                src="/logo-veitiqo-dark.svg"
                                alt="Veitiqo"
                                width={150}
                                height={30}
                                className="hidden dark:block h-8 w-auto"
                                priority
                            />
                        </Link>
                        <p className="mt-4 text-sm text-[var(--text-secondary)]">
                            AI-driven web & growth systems. We design and ship headless websites,
                            automations, and marketing ops that move the needle.
                        </p>

                        {/* סושיאל */}
                        <ul className="mt-4 flex justify-center" aria-label="Social media">
                            {SOCIAL.map(({ href, label, Icon }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        aria-label={label}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)]
                               text-[var(--text-secondary)] hover:text-[var(--foreground)]
                               hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring ring-[var(--brand-primary)]"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* קבוצות קישורים */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        {NAV_GROUPS.map((group) => (
                            <nav key={group.title} aria-label={group.title}>
                                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                                    {group.title}
                                </h3>
                                <ul className="mt-3 space-y-2">
                                    {group.links.map((l) => (
                                        <li key={l.href}>
                                            <Link
                                                href={l.href}
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

            {/* תחתון: זכויות + לינקים קטנים */}
            <div className="border-t border-[var(--border-subtle)]">
                <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-[var(--text-secondary)]">
                        © {year} Veitiqo. All rights reserved.
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
