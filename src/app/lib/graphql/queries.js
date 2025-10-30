// lib/queries.js
import {gql} from 'graphql-request'

/* ---------- Home / Pages ---------- */
export const HOME_QUERY = gql`
  query Home(
    $id: ID!,
    $servicesFirst: Int!, $projectsFirst: Int!, $bundlesFirst: Int!,
    $articlesFirst: Int!, $techNewsFirst: Int!, $eventsFirst: Int!, $faqFirst: Int!
  ) {
    page(id: $id, idType: ID) {
      id
      title
      uri
      seo { title metaDesc }
      homePageFields {
hero {
  heroTitle
  heroSubtitle
  heroContent
  heroBgImage { node { mediaItemUrl sourceUrl altText } }
  heroBgImageMobile { node { mediaItemUrl sourceUrl altText } }
  heroVideoUrl
  heroVideoUrlMobile

  herocta1url { url title target } 
  cta2url     { url title target } 
}

        services {
          showServices
          servicesBgImage { node { mediaItemUrl sourceUrl altText } }
          servicesTitle
          servicesSubtitle
          servicesContent
          servicesSource
          servicesItems { nodes { id uri } }
          servicesDisplayLimit
          servicesOrderBy
          servicesOrder
        }

        bundles {
          showBundles
          bundlesBgImage { node { mediaItemUrl sourceUrl altText } }
          bundlesTitle
          bundlesSubtitle
          bundlesContent
          bundlesSource
          bundlesItems { nodes { id uri } }
          bundlesDisplayLimit
          bundlesOrderBy
          bundlesOrder
        }

        projects {
          showProjects
          projectsBgImage { node { mediaItemUrl sourceUrl altText } }
          projectsTitle
          projectsSubtitle
          projectsContent
          projectsSource
          projectsItems { nodes { id uri } }
          projectsDisplayLimit
          projectsOrderBy
          projectsOrder
        }

        testimonials {
          showTestimonials
          testimonialsBgImage { node { mediaItemUrl sourceUrl altText } }
          testimonialsTitle
          testimonialsSubtitle
          testimonialsContent
          testimonialsSource
          testimonialsItems { nodes { id uri } }
          testimonialsDisplayLimit
          testimonialsOrderBy
          testimonialsOrder
        }

        articles {
          showArticles
          articlesBgImage { node { mediaItemUrl sourceUrl altText } }
          articlesTitle
          articlesSubtitle
          articlesContent
          articlesSource
          articlesItems { nodes { id uri } }
          articlesDisplayLimit
          articlesOrderBy
          articlesOrder
        }

        techNews {
          showTechNews
          tech_newsBgImage { node { mediaItemUrl sourceUrl altText } }
          tech_newsTitle
          tech_newsSubtitle
          tech_newsContent
          tech_newsSource
          tech_newsItems { nodes { id uri } }
          tech_newsDisplayLimit
          tech_newsOrderBy
          tech_newsOrder
        }

        events {
          showEvents
          eventsBgImage { node { mediaItemUrl sourceUrl altText } }
          eventsTitle
          eventsSubtitle
          eventsContent
          eventsSource
          eventsItems { nodes { id uri } }
          eventsDisplayLimit
          eventsOrderBy
          eventsOrder
        }

        faq {
          showFaq
          faqBgImage { node { mediaItemUrl sourceUrl altText } }
          faqTitle
          faqSubtitle
          faqContent
          faqSource
          faqItems { nodes { id uri } }
          faqDisplayLimit
          faqOrderBy
          faqOrder
        }

        about {
          aboutBgImage { node { mediaItemUrl sourceUrl altText } }
          aboutTitle
          aboutSubtitle
          aboutContent
          showabout
        }

        contact {
          contactBgImage { node { mediaItemUrl sourceUrl altText } }
          contactTitle
          contactSubtitle
          contactContent
          useGlobalContact
          contactPhone
          contactEmail
          contactAddress
          contactMapUrl
        }
      }
    }

    services(first: $servicesFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    projects(first: $projectsFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    bundles(first: $bundlesFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    posts(first: $articlesFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri excerpt featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    techNews(first: $techNewsFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    events(first: $eventsFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri featuredImage { node { mediaItemUrl sourceUrl } } }
    }
    faqs(first: $faqFirst, where: { orderby: { field: DATE, order: DESC } }) {
      nodes { id title uri }
    }
  }
`

export const PAGE_BY_SLUG_QUERY = gql`
  query PageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      uri
      content
      featuredImage { node { mediaItemUrl sourceUrl altText } }
      seo { title metaDesc }
    }
  }
`

/* (משאיר גם לשימוש עתידי אם צריך) */
export const SERVICE_QUERY = gql`
  query Service($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      title content uri
      featuredImage { node { mediaItemUrl } }
      seo { title metaDesc }
    }
  }
`

export const PROJECT_QUERY = gql`
  query Project($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title content uri
      featuredImage { node { mediaItemUrl } }
      seo { title metaDesc }
    }
  }
`

/* ---------- Globals ---------- */
export const GLOBALS_QUERY = gql`
  query Globals {
    page(id: 39, idType: DATABASE_ID) {
      id
      title
      globalSettings {
        sitelogo { node { mediaItemUrl sourceUrl altText } }
        favicon { node { mediaItemUrl sourceUrl } }
        defaultogimage { node { mediaItemUrl sourceUrl } }
        brandaccent
        brandprimary
        bodyendhtml
        headhtml
        ga4code
        metapixelid
        phoneNumber
        whatsapp
        email
        facebookAddress { target title url }
        instagramAddress { target title url }
        tiktokAddress { target title url }
        linkdine { target title url }
        xAddress { target title url }
      }
    }
    generalSettings { title url }
  }
`

/* ---------- Menus by Location (אין יותר ערבוב) ---------- */
export const MAIN_MENU_BY_LOCATION = gql`
  query MainMenuByLocation {
    menuItems(first: 100, where: { location: PRIMARY }) {
      nodes { id databaseId label url parentId order }
    }
    generalSettings { title url }
  }
`

export const FOOTER_MENU_BY_LOCATION = gql`
  query FooterMenuByLocation {
    menuItems(first: 100, where: { location: FOOTER }) {
      nodes { id databaseId label url parentId order }
    }
    generalSettings { title url }
  }
`
export const FRONT_PAGE_QUERY = gql`
  query GetFrontPage {
    pages(first: 50) {
      nodes {
        id
        title
        uri
        isFrontPage
      }
    }
  }
`