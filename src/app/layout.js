export const dynamic = 'force-dynamic'
export const revalidate = 0

import './styles/globals.css'
import Header from './components/layout/Header'
import { getClient } from './lib/graphql/client'
import { MAIN_MENU_QUERY, GLOBALS_QUERY } from './lib/graphql/queries'
import { buildMenuTree, getAcfImageUrl } from './lib/wp'

/**
 * ✅ פונקציה לניהול מטאדאטה דינמית כולל favicon
 */
export async function generateMetadata() {
    const client = getClient()
    const globals = await client.request(GLOBALS_QUERY).catch(() => null)
    const faviconUrl = getAcfImageUrl(globals?.page?.globalSettings?.favicon)

    return {
        title: 'EzyProTech | AI Driven Growth',
        description: 'Official website of EzyProTech — Smart business solutions powered by WordPress & Next.js.',
        icons: {
            icon: [
                { url: faviconUrl || '/favicon.png', sizes: '32x32', type: 'image/png' },
                { url: faviconUrl || '/favicon.png', sizes: '192x192', type: 'image/png' },
            ],
            shortcut: [faviconUrl || '/favicon.png'],
            apple: [faviconUrl || '/favicon.png'],
        },
    }
}


/**
 * ✅ Root Layout
 */
export default async function RootLayout({ children }) {
    const client = getClient()

    // --- Menu + Site basics ---
    const res = await client.request(MAIN_MENU_QUERY)
    const allItems = res?.menuItems?.nodes || []
    const siteTitle = res?.generalSettings?.title || 'Site'
    const siteUrl = res?.generalSettings?.url || ''


    const tree = buildMenuTree(allItems, { onlySlug: 'main' })
    const menu = tree.length ? tree : buildMenuTree(allItems)

    // --- Globals (logo בלבד) ---
    const globals = await client.request(GLOBALS_QUERY).catch(() => null)
    const logoUrl = getAcfImageUrl(globals?.page?.globalSettings?.sitelogo) || '/logo.svg'

    const faviconUrl = getAcfImageUrl(globals?.page?.globalSettings?.favicon)
    return (
        <html lang="en" suppressHydrationWarning>
        <body className="bg-gray-950 text-gray-100 antialiased">
        <Header
            menu={menu}
            siteTitle={siteTitle}
            logoUrl={logoUrl}
            siteUrl={siteUrl}
            faviconUrl={faviconUrl}
        />


        {children}
        </body>
        </html>
    )
}
