'use client'

import Link from 'next/link'
import { isInternalUrl } from '@/lib/wp'

export default function Footer({
                                   links = [],
                                   siteTitle = 'EzyProTech',
                                   year = new Date().getFullYear(),
                                   credit = 'Building the future of your business.',
                                   siteUrl = ''
                               }) {
    const NavA = ({ href, children, className = '' }) => {
        const cls = `block ${className}` // block כדי ש-w-1/2 יעבוד במובייל
        if (isInternalUrl(href, siteUrl)) {
            const url = href?.startsWith('http') ? new URL(href, siteUrl).pathname : href
            return <Link href={url} className={cls}>{children}</Link>
        }
        return <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{children}</a>
    }

    return (
        <footer>
            <div className="footer-content mx-auto max-w-7xl px-4 py-6 sm:py-8">
                {/* קישורי הפוטר */}
                <div
                    className="
            footer-links
            flex flex-wrap
            gap-x-4 gap-y-2
            justify-center sm:justify-start
            text-xs sm:text-sm
          "
                >
                    {links?.length > 0 ? (
                        links.map(item => (
                            <NavA
                                key={item.id || item.url}
                                href={item.url}
                                className="
                  w-1/2 text-center
                  sm:w-auto sm:text-left
                "
                            >
                                {item.label}
                            </NavA>
                        ))
                    ) : (
                        <>
                            <Link className="block w-1/2 text-center sm:w-auto sm:text-left" href="#privacy">Privacy Policy</Link>
                            <Link className="block w-1/2 text-center sm:w-auto sm:text-left" href="#terms">Terms of Service</Link>
                            <Link className="block w-1/2 text-center sm:w-auto sm:text-left" href="#careers">Careers</Link>
                        </>
                    )}
                </div>

                {/* זכויות יוצרים */}
                <p className="copyright mt-4 text-center text-xs sm:text-sm">
                    © {year} {siteTitle}. All rights reserved. {credit ? `| ${credit}` : null}
                </p>
            </div>
        </footer>
    )
}
