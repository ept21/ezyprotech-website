// src/app/layout.js
import './globals.css'
import Header from '@/components/Header'
import { getPrimaryMenu } from '@/lib/menu'

export const revalidate = 300

// השאילתא שעבדה לך 1:1 ב-GraphiQL
const Q_GLOBAL = `
  query {
    page(id:"/global-settings/", idType:URI){
      uri
      title
      globalSettings{
        sitelogo       { node { mediaItemUrl sourceUrl altText } }
        favicon        { node { mediaItemUrl sourceUrl altText } }
        defaultogimage { node { mediaItemUrl sourceUrl altText } }
      }
    }
    generalSettings{ title url }
  }
`

async function fetchGlobal() {
    const base = (process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.ezyprotech.com').replace(/\/$/, '')
    const res = await fetch(`${base}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // חשוב: אין here credentials/cookies – זו קריאה ציבורית
        body: JSON.stringify({ query: Q_GLOBAL }),
        cache: 'no-store',
    })
    if (!res.ok) throw new Error(`WPGraphQL HTTP ${res.status}`)
    const json = await res.json()
    if (json?.errors?.length) throw new Error(json.errors[0]?.message || 'GraphQL error')
    return json?.data || {}
}

export default async function RootLayout({ children }) {
    // שליפה ישירה מה-CMS
    let data = {}
    try {
        data = await fetchGlobal()
    } catch (e) {
        console.error('[layout fetchGlobal] error:', e?.message || e)
    }

    const page = data?.page || null
    const gs   = data?.generalSettings || {}
    const g    = page?.globalSettings || {}

    // משתמשים ישירות ב-URLים שחזרו בלי שום נרמול
    const logoUrl    = g?.sitelogo?.node?.mediaItemUrl || g?.sitelogo?.node?.sourceUrl || ''
    const faviconUrl = g?.favicon?.node?.mediaItemUrl  || g?.favicon?.node?.sourceUrl  || ''

    // לוג שרת לאבחון
    console.log('[layout] uri=', page?.uri, 'logo=', logoUrl, 'fav=', faviconUrl)

    const menu = await getPrimaryMenu().catch(() => ({ items: [] }))

    return (
        <html lang="en">
        <head>
            {/* פאביקון: אם אין ערך, פולבאק ל-/favicon.ico */}
            <link rel="icon" href={faviconUrl || '/favicon.ico'} />
            <link rel="apple-touch-icon" href={faviconUrl || '/favicon.ico'} />
            <title>{gs?.title || 'EzyProTech'}</title>
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
