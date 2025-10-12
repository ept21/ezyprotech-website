// src/lib/home.js
import { gql } from '@apollo/client'

/**
 * כרגע אין טיפוסי ACF מותאמים (Hero/LogoStrip/ServicesGrid וכו') בסכמה,
 * לכן נשתמש בשאילתה מינימלית שמחזירה את עמוד הבית לפי ה-URI הקיים: /home/
 * כשתגדיר את ה-ACF Blocks ב-GraphQL, נחזיר לשאילתה המורחבת.
 */
export const HOME_QUERY = gql`
  query HomePage {
    page(id: "/home/", idType: URI) {
      title
      content
      uri
    }
  }
`
