// src/lib/site.js
import { gql } from '@apollo/client'
import { wp } from './wp'

const Q_GLOBAL = gql`
  query GlobalSettingsViaPage {
    page(id: "/global-settings/", idType: URI) {
      id
      title
      globalSettings {
        siteLogo { mediaItemUrl altText }
        favicon { mediaItemUrl }
        defaultOgImage { mediaItemUrl }
        brandPrimary
        brandAccent
        ga4Code
        metaPixelId
        headHtml
        bodyEndHtml
      }
      themeOptions {
        siteLogo { mediaItemUrl altText }
        favicon { mediaItemUrl }
        defaultOgImage { mediaItemUrl }
        brandPrimary
        brandAccent
        ga4Code
        metaPixelId
        headHtml
        bodyEndHtml
      }
    }
    generalSettings { title description url }
  }
`

export async function getSiteData() {
    try {
        const { data } = await wp.query({ query: Q_GLOBAL, fetchPolicy: 'no-cache' })
        const node =
            data?.page?.globalSettings ??
            data?.page?.themeOptions ??
            {}

        const gs = data?.generalSettings ?? {}
        return { opts: node, gs }
    } catch {
        return { opts: {}, gs: { title: 'EzyProTech' } }
    }
}
