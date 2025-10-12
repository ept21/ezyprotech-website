import './globals.css'
import { getSiteData } from '@/lib/site'
import { getPrimaryMenu } from '@/lib/menu'
import Header from '@/components/Header'

export default async function RootLayout({ children }) {
    const { opts, gs } = await getSiteData()
    const menu = await getPrimaryMenu().catch(() => ({ items: [] }))

    const faviconUrl = opts?.favicon?.mediaItemUrl || '/favicon.ico' // ← פולבאק

    return (
        <html lang="en">
        <head>
            <link rel="icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
            {/* GA4 / headHtml כנ״ל... */}
        </head>
        <body className="bg-slate-950 text-slate-50" suppressHydrationWarning>
        <Header
            siteTitle={gs?.title || 'EzyProTech'}
            menuItems={menu.items}
            logoUrl={opts?.siteLogo?.mediaItemUrl || null}
        />
        <main>{children}</main>
        {/* Pixel / bodyEndHtml כנ״ל... */}
        </body>
        </html>
    )
}
