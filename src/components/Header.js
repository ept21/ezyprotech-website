// src/components/Header.js
import Link from 'next/link'

function normalizeUri(uri) {
    if (!uri) return '/'
    try {
        // אם אין NEXT_PUBLIC_SITE_URL ניפול חזרה ל-uri כמו שהוא
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const u = new URL(uri, base)
        return u.pathname + (u.search || '') + (u.hash || '')
    } catch {
        return uri
    }
}

export default function Header({
                                   siteTitle = 'EzyProTech',
                                   menuItems = [],
                                   logoUrl = null,          // ← מקבל לוגו מה-Layout
                               }) {
    const items = Array.isArray(menuItems) ? menuItems : []

    return (
        <header className="border-b border-white/10 sticky top-0 z-50 backdrop-blur bg-slate-950/70">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={siteTitle}
                            width={!logoUrl ? 36 : 150}
                            height={!logoUrl ? 36 : 200}
                            className="rounded-full"
                            loading="eager"
                            decoding="async"
                        />
                    ) : (
                        <span className="text-xl font-extrabold">
              <span className="text-sky-400">Ezy</span>
              <span>Pro</span>
              <span className="text-sky-400">Tech</span>
            </span>
                    )}
                </Link>

                <nav className="hidden md:block">
                    <ul className="flex items-center gap-6">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link href={normalizeUri(item.uri)} className="text-sm hover:text-sky-400">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <Link
                    href="/contact-us/"
                    className="hidden md:inline-flex rounded-2xl px-4 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 text-sm font-semibold"
                >
                    Contact
                </Link>

                {/* מובייל – תפריט מינימלי */}
                <details className="md:hidden">
                    <summary className="cursor-pointer px-3 py-2 rounded-xl border border-white/15 text-sm">Menu</summary>
                    <ul className="mt-2 bg-slate-900/95 rounded-xl p-3 space-y-2 border border-white/10">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link href={normalizeUri(item.uri)} className="block px-3 py-2 rounded hover:bg-white/5">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/contact-us/"
                                className="block px-3 py-2 rounded bg-gradient-to-r from-sky-500 to-fuchsia-500 text-center"
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>
                </details>
            </div>
        </header>
    )
}
