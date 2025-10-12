// src/lib/site.js
import { gql } from '@apollo/client'
import { wp } from './wp'

const MEDIA = `
  mediaItemUrl
  sourceUrl
  altText
`

// זהה לשאילתה שעבדה לך ב-GraphiQL – קבועה, בלי משתנים
const Q_GLOBAL_SETTINGS = gql`
  query GlobalSettings_Node {
    page(id:"/global-settings/", idType:URI){
      uri
      title
      globalSettings{
        sitelogo       { node { ${MEDIA} } }
        favicon        { node { ${MEDIA} } }
        defaultogimage { node { ${MEDIA} } }
        brandprimary
        brandaccent
        ga4code
        metapixelid
        headhtml
        bodyendhtml
        facebook_address
        instagram_address
        x_address
        tiktok_address
        linkdine_address
        phone_number
        email
        whatsapp
      }
    }
    generalSettings{ title url }
  }
`

function pickFirstMedia(item) {
    if (!item) return null
    if (item.mediaItemUrl || item.sourceUrl) {
        return { url: item.mediaItemUrl || item.sourceUrl || '', alt: item.altText || '' }
    }
    if (item.node) {
        const n = item.node
        return { url: n.mediaItemUrl || n.sourceUrl || '', alt: n.altText || '' }
    }
    const n = item?.edges?.[0]?.node
    if (n) return { url: n.mediaItemUrl || n.sourceUrl || '', alt: n.altText || '' }
    return null
}

function normalizeFromPage(node) {
    if (!node) return {}
    return {
        siteLogo:       pickFirstMedia(node.sitelogo),
        favicon:        pickFirstMedia(node.favicon),
        defaultOgImage: pickFirstMedia(node.defaultogimage),
        brandPrimary:   node.brandprimary || null,
        brandAccent:    node.brandaccent  || null,
        ga4Code:        node.ga4code      || null,
        metaPixelId:    node.metapixelid  || null,
        headHtml:       node.headhtml     || null,
        bodyEndHtml:    node.bodyendhtml  || null,
        social: {
            facebook:  node.facebook_address  || null,
            instagram: node.instagram_address || null,
            x:         node.x_address         || null,
            tiktok:    node.tiktok_address    || null,
            linkedin:  node.linkdine_address  || null,
            phone:     node.phone_number      || null,
            email:     node.email             || null,
            whatsapp:  node.whatsapp          || null,
        },
    }
}

export async function getSiteData() {
    try {
        const { data } = await wp.query({ query: Q_GLOBAL_SETTINGS, fetchPolicy: 'no-cache' })
        const page = data?.page
        const opts = normalizeFromPage(page?.globalSettings)
        const gs   = data?.generalSettings ?? {}

        // לוגים בצד השרת לזיהוי מהיר
        console.log('[site.js] page.uri=', page?.uri,
            ' logo=', opts?.siteLogo?.url,
            ' favicon=', opts?.favicon?.url)

        return { opts: opts || {}, gs }
    } catch (e) {
        console.log('[site.js] ERROR:', e?.message || e)
        return { opts: {}, gs: {} }
    }
}
