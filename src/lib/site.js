// src/lib/site.js
import { gql } from '@apollo/client'
import { wp } from './wp'

// גרסת "סייפ" – לא תלויה בשום ACF/Options. מביאה רק generalSettings.
const SITE_BASICS = gql`
  query SiteBasics {
    generalSettings {
      title
      url
      description
    }
  }
`

export async function getSiteData() {
    try {
        const { data } = await wp.query({ query: SITE_BASICS, fetchPolicy: 'no-cache' })
        return {
            settings: data?.generalSettings ?? null,
            // opts מחזיר אובייקט ריק במקום themeOptions כדי שהקוד שלך לא יקרוס
            opts: {}
        }
    } catch (e) {
        console.warn('getSiteData failed, returning defaults:', e?.message || e)
        return { settings: null, opts: {} }
    }
}
