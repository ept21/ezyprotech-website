import { gql } from '@apollo/client'
import { wp } from '@/lib/wp'

// מחזיר שדות SEO של Yoast עבור דף לפי URI
export const SEO_PAGE = gql`
  query SeoPageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphUrl
        opengraphSiteName
        opengraphImage { mediaItemUrl }
        twitterTitle
        twitterDescription
        twitterImage { mediaItemUrl }
      }
    }
  }
`;

// מחזיר שדות SEO של Yoast עבור פוסט לפי slug
export const SEO_POST = gql`
  query SeoPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphUrl
        opengraphSiteName
        opengraphImage { mediaItemUrl }
        twitterTitle
        twitterDescription
        twitterImage { mediaItemUrl }
      }
    }
  }
`;

// מאחד את תוצאת ה-SEO לאובייקט Metadata של Next.js
export function yoastToMetadata(seo) {
    if (!seo) return {}
    const ogImage = seo.opengraphImage?.mediaItemUrl || undefined
    const twImage = seo.twitterImage?.mediaItemUrl || ogImage
    return {
        title: seo.title || seo.opengraphTitle || undefined,
        description: seo.metaDesc || seo.opengraphDescription || undefined,
        alternates: { canonical: seo.canonical || undefined },
        openGraph: {
            title: seo.opengraphTitle || seo.title || undefined,
            description: seo.opengraphDescription || seo.metaDesc || undefined,
            url: seo.opengraphUrl || seo.canonical || undefined,
            siteName: seo.opengraphSiteName || undefined,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: seo.twitterTitle || seo.title || undefined,
            description: seo.twitterDescription || seo.metaDesc || undefined,
            images: twImage ? [twImage] : undefined,
        },
    }
}
