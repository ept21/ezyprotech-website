// app/layout.js
import { gqlRequest } from '@/app/lib/graphql/client'
import {
    MAIN_MENU_BY_LOCATION,
    FOOTER_MENU_BY_LOCATION,
    GLOBALS_QUERY,
} from '@/app/lib/graphql/queries'
import { buildMenuTree, getAcfImageUrl } from '@/app/lib/wp'
import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'
import Analytics from '@/app/components/analytics/Analytics'
import FloatingContactFab from '@/app/components/layout/FloatingContactFab'

import '@/app/styles/electric-xtra.css'
import '@/app/styles/globals.css'

// Helper to remove undefined / null / empty arrays from schema objects
function cleanObject(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => {
            if (value === undefined || value === null) return false
            if (Array.isArray(value) && value.length === 0) return false
            return true
        }),
    )
}

export default async function RootLayout({ children }) {
    let globalsRes = null
    let mainRes = null
    let footerRes = null

    // Fetch globals
    try {
        globalsRes = await gqlRequest(GLOBALS_QUERY)
    } catch (err) {
        console.warn('[WP] Globals fetch failed:', err.message)
    }

    // Fetch menus
    try {
        mainRes = await gqlRequest(MAIN_MENU_BY_LOCATION)
    } catch (err) {
        console.warn('[WP] Main menu fetch failed:', err.message)
    }

    try {
        footerRes = await gqlRequest(FOOTER_MENU_BY_LOCATION)
    } catch (err) {
        console.warn('[WP] Footer menu fetch failed:', err.message)
    }

    const siteTitle = globalsRes?.generalSettings?.title ?? 'Veltiqo'
    const siteUrl = globalsRes?.generalSettings?.url ?? ''
    const gs = globalsRes?.page?.globalSettings

    const faviconUrl = getAcfImageUrl(gs?.favicon) || '/favicon.ico'
    const sitelogo = getAcfImageUrl(gs?.sitelogo)

    const ga4Code = gs?.ga4code || ''
    const metaPixelId = gs?.metapixelid || ''

    const phone = gs?.phone || gs?.phoneNumber || ''
    const whatsapp = gs?.whatsapp || gs?.whatsappNumber || ''

    const mainItems = mainRes?.menuItems?.nodes ?? []
    const footerItems = footerRes?.menuItems?.nodes ?? []
    const mainMenuTree = buildMenuTree(mainItems)

    const footerLinks = footerItems
        .filter((n) => !n.parentId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((n) => ({ id: n.id, label: n.label, url: n.url }))

    // Build global JSON-LD (Organization + WebSite)
    const sameAs = [
        gs?.facebookAddress,
        gs?.instagramAddress,
        gs?.tiktokAddress,
        gs?.linkdine,
        gs?.xAddress,
        gs?.youtubeAddress,
    ].filter(Boolean)

    const organizationSchema = cleanObject({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteTitle,
        url: siteUrl || undefined,
        logo: sitelogo || undefined,
        telephone: phone || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
    })

    const websiteSchema = siteUrl
        ? cleanObject({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: siteUrl,
            name: siteTitle,
        })
        : null

    const globalSchema = [organizationSchema, websiteSchema].filter(Boolean)

    return (
        <html lang="en">
        <head>
            {/* Global, non-page-specific tags */}
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />

            {faviconUrl && (
                <>
                    <link rel="icon" href={faviconUrl} />
                    <link rel="shortcut icon" href={faviconUrl} />
                </>
            )}

            {/* Global JSON-LD (Organization + WebSite) – lives in <head>, not in <body> */}
            {globalSchema.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(globalSchema),
                    }}
                />
            )}
        </head>

        <body suppressHydrationWarning>
        <Header
            menu={mainMenuTree}
            siteTitle={siteTitle}
            faviconUrl={faviconUrl}
            siteUrl={siteUrl}
            sitelogo={sitelogo}
        />

        {children}

        <Footer
            links={footerLinks}
            siteTitle={siteTitle}
            sitelogo={sitelogo}
            socials={{
                facebook: gs?.facebookAddress,
                instagram: gs?.instagramAddress,
                tiktok: gs?.tiktokAddress,
                linkedin: gs?.linkdine,
                x: gs?.xAddress,
            }}
            address={gs?.address}
        />

        <FloatingContactFab
            phone={phone}
            whatsapp={whatsapp}
            showOnMobile
        />

        <Analytics ga4Code={ga4Code} metaPixelId={metaPixelId} />
        </body>
        </html>
    )
}
