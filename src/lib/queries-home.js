// src/lib/queries-home.js
import { gql } from '@apollo/client'

/**
 * שדות דף הבית (ACF: homepage)
 * שים לב: כאן השמות בפורמט camelCase כפי שה-Schema שלך החזיר לנו ב-GraphiQL.
 */
export const Q_HOME_FIELDS = gql`
  query HomeFields {
    page(id: "/", idType: URI) {
      id
      title
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
 * פוסטים לפי קטגוריה (לכל הסקשנים שמוגדרים "posts_category")
 */
export const Q_POSTS_BY_CATEGORY = gql`
  query PostsByCategory($cat: String!, $limit: Int!) {
    posts(
      where: {
        categoryName: $cat
        orderby: { field: DATE, order: DESC }
        status: PUBLISH
      }
      first: $limit
    ) {
      nodes {
        id
        title
        uri
        excerpt
        content
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

/**
 * CPTs — שמות טיפוסיים ב-WPGraphQL לפי labels שהקמנו:
 * Services, Projects, Testimonials, FAQs, Badges, Hero Slides
 * (אם שמך שונה מעט — עידכן לי ונחליף)
 */
export const Q_SERVICES = gql`
  query Services($limit: Int!) {
    services(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        excerpt
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

export const Q_PROJECTS = gql`
  query Projects($limit: Int!) {
    projects(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        excerpt
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

export const Q_TESTIMONIALS = gql`
  query Testimonials($limit: Int!) {
    testimonials(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        content
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

export const Q_FAQ = gql`
  query FAQs($limit: Int!) {
    faqs(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        content
      }
    }
  }
`

export const Q_BADGES = gql`
  query Badges($limit: Int!) {
    badges(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        content
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`

export const Q_HERO_SLIDES = gql`
  query HeroSlides($limit: Int!) {
    heroSlides(first: $limit, where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }) {
      nodes {
        id title uri
        excerpt
        content
        featuredImage { node { sourceUrl mediaItemUrl altText } }
      }
    }
  }
`
