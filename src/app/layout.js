// app/layout.js
import { gqlRequest } from '@/app/lib/graphql/client'
import { MAIN_MENU_BY_LOCATION, FOOTER_MENU_BY_LOCATION, GLOBALS_QUERY } from '@/app/lib/graphql/queries'
import { buildMenuTree, getAcfImageUrl } from '@/app/lib/wp'
import Header from '@/app/components/layout/Header'
import Footer from '@/app/components/layout/Footer'
import Analytics from '@/app/components/analytics/Analytics'
import HeadMeta from '@/app/components/seo/HeadMeta'

import '@/app/styles/electric-xtra.css'
import '@/app/styles/globals.css'



export default async function RootLayout({ children }) {
    let globalsRes = null, mainRes = null, footerRes = null;

    // Fetch globals
    try {
        globalsRes = await gqlRequest(GLOBALS_QUERY);
    } catch (err) {
        console.warn("[WP] Globals fetch failed:", err.message, err.graphQLErrors ? JSON.stringify(err.graphQLErrors, null, 2) : "");
    }

    // Fetch main menu
    try {
        mainRes = await gqlRequest(MAIN_MENU_BY_LOCATION);
    } catch (err) {
        console.warn("[WP] Main menu fetch failed:", err.message);
    }

    // Fetch footer menu
    try {
        footerRes = await gqlRequest(FOOTER_MENU_BY_LOCATION);
    } catch (err) {
        console.warn("[WP] Footer menu fetch failed:", err.message);
    }

    const siteTitle = globalsRes?.generalSettings?.title ?? 'Veitiqo';
    const siteUrl   = globalsRes?.generalSettings?.url   ?? '';
    const gs        = globalsRes?.page?.globalSettings;

    const faviconUrl = getAcfImageUrl(gs?.favicon);
    const sitelogo   = getAcfImageUrl(gs?.sitelogo);
    const defaultOg  = getAcfImageUrl(gs?.defaultogimage);
    const ga4Code    = gs?.ga4code || '';
    const metaPixelId= gs?.metapixelid || '';

    const mainItems   = mainRes?.menuItems?.nodes   ?? [];
    const footerItems = footerRes?.menuItems?.nodes ?? [];

    const mainMenuTree = buildMenuTree(mainItems);
    const footerLinks = footerItems
        .filter(n => !n.parentId)
        .sort((a,b) => (a.order ?? 0) - (b.order ?? 0))
        .map(n => ({ id: n.id, label: n.label, url: n.url }));

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
            sitelogo={sitelogo}
        />
        {children}
        <Footer
            links={footerLinks}
            siteTitle={siteTitle}
            sitelogo={sitelogo}
            socials={{
                facebook: gs?.facebookAddress,   // {url,title,target} או ריק
                instagram: gs?.instagramAddress,
                tiktok: gs?.tiktokAddress,
                linkedin: gs?.linkdine,
                x: gs?.xAddress,
            }}
        />
        <Analytics ga4Code={ga4Code} metaPixelId={metaPixelId} />
        </body>
        </html>
    );
}
