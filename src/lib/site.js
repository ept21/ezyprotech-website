import { gql } from '@apollo/client'
import { wp } from './wp'

/** שאילתות – קודם globalSettings עם node, אח"כ וריאציות נוספות כגיבוי */
const Q_GLOBAL_NODE = gql`
  query GlobalSettings_Node {
    page(id:"/global-settings/", idType:URI){
      globalSettings{
        sitelogo       { node { mediaItemUrl sourceUrl altText } }
        favicon        { node { mediaItemUrl sourceUrl altText } }
        defaultogimage { node { mediaItemUrl sourceUrl altText } }
        brandprimary
        brandaccent
        ga4code
        metapixelid
        headhtml
        bodyendhtml
      }
    }
    generalSettings{ title url }
  }
`

const Q_GLOBAL_ITEM = gql`
  query GlobalSettings_Item {
    page(id:"/global-settings/", idType:URI){
      globalSettings{
        sitelogo       { mediaItemUrl sourceUrl altText }
        favicon        { mediaItemUrl sourceUrl altText }
        defaultogimage { mediaItemUrl sourceUrl altText }
        brandprimary
        brandaccent
        ga4code
        metapixelid
        headhtml
        bodyendhtml
      }
    }
    generalSettings{ title url }
  }
`

const Q_GLOBAL_EDGES = gql`
  query GlobalSettings_Edges {
    page(id:"/global-settings/", idType:URI){
      globalSettings{
        sitelogo       { edges { node { mediaItemUrl sourceUrl altText } } }
        favicon        { edges { node { mediaItemUrl sourceUrl altText } } }
        defaultogimage { edges { node { mediaItemUrl sourceUrl altText } } }
        brandprimary
        brandaccent
        ga4code
        metapixelid
        headhtml
        bodyendhtml
      }
    }
    generalSettings{ title url }
  }
`

const Q_GENERAL_ONLY = gql`
  query GeneralOnly {
    generalSettings{ title description url }
  }
`

/** מאחד שלוש צורות אפשריות לשדה תמונה לאובייקט אחיד { url, alt } */
function pickFirstMedia(item) {
    if (!item) return null
    // 1) MediaItem ישיר
    if (item.mediaItemUrl || item.sourceUrl) {
        return { url: item.mediaItemUrl || item.sourceUrl || null, alt: item.altText || '' }
    }
    // 2) Edge יחיד: { node: {...} }
    if (item.node) {
        const n = item.node
        return { url: n.mediaItemUrl || n.sourceUrl || null, alt: n.altText || '' }
    }
    // 3) Connection: { edges: [{ node: {...} }] }
    const n = item?.edges?.[0]?.node
    if (n) {
        return { url: n.mediaItemUrl || n.sourceUrl || null, alt: n.altText || '' }
    }
    return null
}

/** ממפה שמות השדות באותיות קטנות למבנה תקני */
function normalizeTheme(node) {
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
    }
}

export async function getSiteData() {
    // 1) globalSettings – node
    try {
        const { data } = await wp.query({ query: Q_GLOBAL_NODE, fetchPolicy: 'no-cache' })
        const opts = normalizeTheme(data?.page?.globalSettings)
        const gs   = data?.generalSettings ?? {}
        if (opts && (opts.siteLogo || opts.favicon || opts.brandPrimary || opts.ga4Code)) return { opts, gs }
    } catch {}

    // 2) globalSettings – item
    try {
        const { data } = await wp.query({ query: Q_GLOBAL_ITEM, fetchPolicy: 'no-cache' })
        const opts = normalizeTheme(data?.page?.globalSettings)
        const gs   = data?.generalSettings ?? {}
        if (opts && (opts.siteLogo || opts.favicon || opts.brandPrimary || opts.ga4Code)) return { opts, gs }
    } catch {}

    // 3) globalSettings – edges
    try {
        const { data } = await wp.query({ query: Q_GLOBAL_EDGES, fetchPolicy: 'no-cache' })
        const opts = normalizeTheme(data?.page?.globalSettings)
        const gs   = data?.generalSettings ?? {}
        if (opts && (opts.siteLogo || opts.favicon || opts.brandPrimary || opts.ga4Code)) return { opts, gs }
    } catch {}

    // 4) פולבאק
    const { data } = await wp.query({ query: Q_GENERAL_ONLY, fetchPolicy: 'no-cache' })
    return { opts: {}, gs: data?.generalSettings ?? {} }
}
