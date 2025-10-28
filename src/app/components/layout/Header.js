'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { isInternalUrl } from '../../lib/wp'

export default function Header({ menu = [], siteTitle = 'Site', logoUrl = null, siteUrl = '' }) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const NavItem = ({ item }) => {
        const active = item?.url && (item.url === siteUrl ? pathname === '/' : pathname === new URL(item.url, siteUrl).pathname)
        const baseClass = 'px-3 py-2 rounded-md text-sm font-medium transition-colors'
        const cls = active ? `${baseClass} bg-white/10` : `${baseClass} hover:bg-white/10`

        if (isInternalUrl(item.url, siteUrl)) {
            return <Link href={item.url} className={cls}>{item.label}</Link>
        }
        return (
            <a href={item.url} target="_blank" rel="noopener" className={cls}>
                {item.label}
            </a>
        )
    }

    return (
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Branding */}
                    <div className="flex items-center gap-3">
                        {logoUrl ? (
                            <Link href="/" aria-label={siteTitle} className="inline-flex items-center">
                                <img src={logoUrl} alt={siteTitle} className="h-48 w-48" />
                            </Link>
                        ) : (
                            <Link href="/" className="text-lg font-semibold">{siteTitle}</Link>
                        )}
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {menu.map((item) => (
                            <div key={item.id} className="relative">
                                <NavItem item={item} />
                                {/* אם יש ילדים – בהמשך אפשר להוסיף dropdown */}
                            </div>
                        ))}
                    </nav>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="inline-block">
                            {open ? (
                                <path fill="currentColor" d="M18 6L6 18M6 6l12 12"/>
                            ) : (
                                <path fill="currentColor" d="M4 7h16M4 12h16M4 17h16"/>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile panel */}
            {open && (
                <div className="md:hidden border-t border-white/10">
                    <nav className="px-4 py-3 space-y-1">
                        {menu.map((item) => (
                            <div key={item.id}>
                                <NavItem item={item} />
                                {item.children?.length ? (
                                    <div className="pl-4 mt-1 space-y-1">
                                        {item.children.map(child => <NavItem key={child.id} item={child} />)}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
