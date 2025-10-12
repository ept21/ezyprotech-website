// src/app/layout.js
import './globals.css'
import { getSiteData } from '@/lib/site'
import { getPrimaryMenu } from '@/lib/menu'
import { ensureCmsUrl } from '@/lib/url'
import Header from '@/components/Header'

export const revalidate = 300

export default async function RootLayout({ children }) {
    const { opts = {}, gs = {} } = await getSiteData()
    const menu = await getPrimaryMenu().catch(() => ({ items: [] }))

    // לוגים בצד השרת כדי לראות מה הגיע
    // שים לב: הלוגים האלה יופיעו בטרמינל (Server)
    console.log('Server  getSiteData.opts:', JSON.stringify(opts))
    console.log('Server  getSiteData.gs:', JSON.stringify(gs))

    // קח את ה-raw מה-CMS, ואז נרמל
    const logoUrlRaw    = opts?.siteLogo?.url || ''
    const faviconUrlRaw = opts?.favicon?.url || ''

    // לוגים לפני נרמול
    console.log('Server  raw logoUrl:', logoUrlRaw)
    console.log('Server  raw faviconUrl:', faviconUrlRaw)

    const logoUrl    = ensureCmsUrl(logoUrlRaw)
    const faviconUrl = ensureCmsUrl(faviconUrlRaw) || '/favicon.ico'

    // לוגים אחרי נרמול
    console.log('Server  normalized logoUrl:', logoUrl)
    console.log('Server  normalized faviconUrl:', faviconUrl)

    return (
        <html lang="en">
        <head>
            <link rel="icon" href={faviconUrl} />
            {/* אם תרצה לכסות Safari, העלה PNG/ICO ב-CMS והוסף גם:
        <link rel="icon" type="image/png" sizes="32x32" href={ensureCmsUrl('/wp-content/uploads/.../favicon-32x32.png')} />
        <link rel="apple-touch-icon" sizes="180x180" href={ensureCmsUrl('/wp-content/uploads/.../apple-touch-icon.png')} />
        */}
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
