import './globals.css'
import { getSiteData } from '@/lib/site'
import { getPrimaryMenu } from '@/lib/menu'
import { ensureCmsUrl } from '@/lib/url'     // ← הוספת ייבוא
import Header from '@/components/Header'

export default async function RootLayout({ children }) {
    const { opts, gs } = await getSiteData()
    const menu = await getPrimaryMenu().catch(() => ({ items: [] }))

    // נמיר ל-URL מוחלט ונגדיר פולבאק ל-favicon
    const logoUrl    = ensureCmsUrl(opts?.siteLogo?.url || null)
    const faviconUrl = ensureCmsUrl(opts?.favicon?.url || '') || '/favicon.ico'

    return (
        <html lang="en">
        <head>
            <link rel="icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />

        </head>
        <body className="bg-slate-950 text-slate-50" suppressHydrationWarning>
        <Header
            siteTitle={gs?.title || 'EzyProTech'}
            menuItems={menu.items}
            logoUrl={logoUrl}
        />
        <main>{children}</main>

        </body>
        </html>
    )
}
