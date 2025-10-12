// src/lib/queries-home.js
import { gql } from '@apollo/client'

/**
 * שדות דף הבית (ACF group: homepage) מהדף הראשי.
 * אם אצלך הדף הראשי הוא ב-URI "/home/" – שנה את המשתנה HOME_URI למטה בקובץ getHomeData.js.
 */
export const Q_HOME_FIELDS = gql`
  query HomeFields($uri: ID!) {
    page(id: $uri, idType: URI) {
      id
      title
      uri
      homepage {
        heroEnable
        heroLayout
        heroSource
        heroCategorySlug
        heroLimit
        heroProjectsLimit
        heroServicesLimit
        heroHeroLimit
        heroGalleryJson

        badgesEnable
        badgesSource
        badgesCategorySlug
        badgesLimit
        badgesLimitCpt
        badgesLinkField
        badgesJson

        servicesEnable
        servicesTitle
        servicesSubtitle
        servicesLimit
        servicesSort
        servicesFilterCategory
        servicesShowCta
        servicesCtaText
        servicesCtaUrl

        projectsEnable
        projectsTitle
        projectsSubtitle
        projectsLimit
        projectsSort
        projectsFilterIndustry
        projectsFilterTech
        projectsShowCta
        projectsCtaText
        projectsCtaUrl

        newsEnable
        newsTitle
        newsSubtitle
        newsCategorySlug
        newsLimit

        socialproofEnable
        socialproofSource
        socialproofCategorySlug
        socialproofLimit
        socialproofTitle
        socialproofSubtitle

        faqEnable
        faqTitle
        faqSource
        faqCategorySlug
        faqLimit

        contactEnable
        contactTitle
        contactSubtitle
        contactFormProvider
        contactFormEmbed
        contactFormId
        contactEndpointSlug
        contactSuccessMessage
        contactConsentLabel
        contactPrivacyLinkOverride

        mediaEnable
        mediaTitle
        mediaSource
        mediaCategorySlug
        mediaLimit
        mediaLimitProjects
        mediaLimitServices
        mediaItemsJson
      }
    }
  }
`

/**
 * שים לב: $cat אופציונלי! limit נקבל תמיד בקוד (דיפולט).
 * אם $cat=null – WPGraphQL יתעלם מהפילטר categoryName.
 */
export const Q_HERO_SLIDES = gql`
  query HeroSlides($cat: String, $limit: Int!) {
    posts(where: { categoryName: $cat }, first: $limit) {
      nodes {
        id
        title
        uri
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

export const Q_POSTS_BY_CATEGORY = gql`
  query PostsByCategory($cat: String, $limit: Int!) {
    posts(where: { categoryName: $cat }, first: $limit) {
      nodes {
        id
        title
        uri
        featuredImage { node { sourceUrl mediaItemUrl altText } }
        date
        excerpt
      }
    }
  }
`

/** שירותים (CPT) – עדכן את שם ה־CPT אם אצלך שונה מ-"service" */
export const Q_SERVICES = gql`
  query ServicesList($limit: Int!) {
    services(first: $limit) {
      nodes {
        id
        title
        uri
        featuredImage { node { sourceUrl mediaItemUrl altText } }
        date
      }
    }
  }
`

/** פרויקטים (CPT) – עדכן את שם ה־CPT אם אצלך שונה מ-"project" */
export const Q_PROJECTS = gql`
  query ProjectsList($limit: Int!) {
    projects(first: $limit) {
      nodes {
        id
        title
        uri
        featuredImage { node { sourceUrl mediaItemUrl altText } }
        date
      }
    }
  }
`

/** המלצות – לפי קטגוריה */
export const Q_TESTIMONIALS = gql`
  query TestimonialsByCategory($cat: String, $limit: Int!) {
    posts(where: { categoryName: $cat }, first: $limit) {
      nodes {
        id
        title
        content
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

/** שאלות ותשובות – לפי קטגוריה */
export const Q_FAQ = gql`
  query FaqByCategory($cat: String, $limit: Int!) {
    posts(where: { categoryName: $cat }, first: $limit) {
      nodes {
        id
        title
        content
      }
    }
  }
`
