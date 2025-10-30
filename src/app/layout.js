// app/layout.js
import { request } from 'graphql-request'
import { MAIN_MENU_BY_LOCATION, FOOTER_MENU_BY_LOCATION, GLOBALS_QUERY } from '@/lib/graphql/queries'
import { buildMenuTree, getAcfImageUrl } from '@/lib/wp'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/analytics/Analytics'
import HeadMeta from '@/components/seo/HeadMeta'

import '@/styles/electric-xtra.css'
import '@/styles/globals.css'

const endpoint = process.env.NEXT_PUBLIC_CMS_URL

export default async function RootLayout({ children }) {
    if (!endpoint) {
        throw new Error('Missing NEXT_PUBLIC_CMS_URL env var')
    }

    const [globalsRes, mainRes, footerRes] = await Promise.all([
        request(endpoint, GLOBALS_QUERY),
        request(endpoint, MAIN_MENU_BY_LOCATION),
        request(endpoint, FOOTER_MENU_BY_LOCATION),
    ])

    const siteTitle   = globalsRes?.generalSettings?.title ?? 'EzyProTech'
    const siteUrl     = globalsRes?.generalSettings?.url   ?? ''
    const gs          = globalsRes?.page?.globalSettings
    const faviconUrl  = getAcfImageUrl(gs?.favicon)
    const defaultOg   = getAcfImageUrl(gs?.defaultogimage)
    const ga4Code     = gs?.ga4code || ''           // דוגמה: G-XXXXXXX
    const metaPixelId = gs?.metapixelid || ''       // דוגמה: 1234567890

    const mainItems   = mainRes?.menuItems?.nodes   ?? []
    const footerItems = footerRes?.menuItems?.nodes ?? []

    const mainMenuTree = buildMenuTree(mainItems)
    const footerLinks  = footerItems
        .filter(n => !n.parentId)
        .sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
        .map(n => ({ id: n.id, label: n.label, url: n.url }))

    return (
        <html lang="en">
        <head>
            <HeadMeta
                siteTitle={siteTitle}
                siteUrl={siteUrl}
                faviconUrl={faviconUrl}
                defaultOgImage={defaultOg}
                tagline="Build the Future of Your Business"
            />
        </head>
        <body>
        <Header
            menu={mainMenuTree}
            siteTitle={siteTitle}
            faviconUrl={faviconUrl}
            siteUrl={siteUrl}
        />
        {children}
        <Footer
            links={footerLinks}
            siteTitle={siteTitle}
            siteUrl={siteUrl}
        />
        <Analytics ga4Code={ga4Code} metaPixelId={metaPixelId} />
        </body>
        </html>
    )
}
