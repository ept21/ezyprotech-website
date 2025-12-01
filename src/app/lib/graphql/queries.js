// lib/graphql/queries.js
import { gql } from 'graphql-request'

/* ---------- Hero (Home) ---------- */
export const HERO_QUERY = gql`
  query HeroPage($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        hero {
          heroTitle
          kicker
          heroSubtitle
          heroContent
          heroBgImage { node { mediaItemUrl sourceUrl altText } }
          heroBgImageMobile { node { mediaItemUrl sourceUrl altText } }
          heroVideoUrl
          heroVideoUrlMobile
          herocta1url { url title target }
          herocta2url { url title target }
        }
      }
    }
  }
`


/* ---------- Services (Home section) ---------- */
export const SERVICES_HOME_PAGE_QUERY = gql`
  query ServicesHome($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        services {
          showServices
          servicesBgImage { node { mediaItemUrl sourceUrl altText } }
          mobileBackgroundImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          servicesTitle
          servicesSubtitle
          servicesContent
          servicesdisplaylimit
          ctaurl { url title target }

          servicesItems {
            nodes {
              ... on ServiceCategory {
                id
                databaseId
                name
                slug
                uri
                description

                servicesCategory {
                  kicker
                  title
                  bullets
                  serviceCategoryImage {
                    node {
                      mediaItemUrl
                      sourceUrl
                      altText
                    }
                  }
                  ctaButton {
                    url
                    title
                    target
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;








/* ---------- Bundles (Home section) ---------- */
export const BUNDLES_HOME_PAGE_QUERY = gql`
  query BundlesHome($id: ID!, $first: Int = 12) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        bundles {
          showBundles
          bundlesBgImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          bundlesTitle
          bundlesSubtitle
          bundlesContent
          bundlesSource
          bundlesDisplayLimit
          bundlesOrderBy
          bundlesOrder
          ctaurl { url title target }

          bundlesItems {
            nodes {
              ... on Bundle {
                id
                databaseId
                uri
                title
                featuredImage { node { mediaItemUrl sourceUrl altText } }
               
                bundlesFields: bundlesfields {
                  kicker
                  title
                  price
                  textNearPriceMonthlyYearlyOrOther
                  productsIncludes
                  ctaurl1 { url title target }
                  ctaurl2 { url title target }
                }
              }
            }
          }
        }
      }
    }

    bundles(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        uri
        title
        featuredImage { node { mediaItemUrl sourceUrl altText } }
        
        bundlesFields: bundlesfields {
          kicker
          title
          price
          textNearPriceMonthlyYearlyOrOther
          productsIncludes
          ctaurl1 { url title target }
          ctaurl2 { url title target }
        }
      }
    }
  }
`;


/* ---------- About (Home section) ---------- */
export const ABOUT_HOME_PAGE_QUERY = gql`
  query AboutHome($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        about {
          showabout
          aboutBgImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          aboutTitle
          aboutSubtitle
          aboutContent
          image1 { node { mediaItemUrl sourceUrl altText } }
          image2 { node { mediaItemUrl sourceUrl altText } }
          image3 { node { mediaItemUrl sourceUrl altText } }
          image4 { node { mediaItemUrl sourceUrl altText } }
          ctaurl1 { url title target }
          ctaurl2 { url title target }
        }
      }
    }
  }
`;


/* ---------- Projects (Home section) ---------- */
export const PROJECTS_HOME_PAGE_QUERY = gql`
  query ProjectsHome($id: ID!, $first: Int = 8) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        projects {
          showProjects
          projectsBgImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          projectsTitle
          projectsSubtitle
          projectsContent
          projectsSource
          projectsDisplayLimit
          projectsOrderBy
          projectsOrder

          projectsItems {
            nodes {
              ... on Project {
                id
                databaseId
                uri
                title
                featuredImage { node { mediaItemUrl sourceUrl altText } }
                projectsFields: projectsfields {
                  kicker
                  title
                  subtitle
                  excerpt
                  categorylabel
                  projectimage { node { mediaItemUrl sourceUrl altText } }
                  projectbgimage { node { mediaItemUrl sourceUrl altText } }
                  projectlink { url title target }
                  projectvideo
                  projectanalytics { node { mediaItemUrl sourceUrl altText } }
                  ctaurl1 { url title target }
                  ctaurl2 { url title target }
                }
              }
            }
          }
        }
      }
    }

    projects(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        uri
        title
        featuredImage { node { mediaItemUrl sourceUrl altText } }
        projectsFields: projectsfields {
          kicker
          title
          subtitle
          excerpt
          categorylabel
          projectimage { node { mediaItemUrl sourceUrl altText } }
          projectbgimage { node { mediaItemUrl sourceUrl altText } }
          projectlink { url title target }
          projectvideo
          projectanalytics { node { mediaItemUrl sourceUrl altText } }
          ctaurl1 { url title target }
          ctaurl2 { url title target }
        }
      }
    }
  }
`;


/* ---------- Testimonials (Home section) ---------- */
export const TESTIMONIALS_HOME_PAGE_QUERY = gql`
  query TestimonialsHome($id: ID!, $first: Int = 12) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        testimonials {
          showTestimonials
          testimonialsBgImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          testimonialsTitle
          testimonialsSubtitle
          testimonialsContent
          testimonialsSource
          testimonialsDisplayLimit
          testimonialsOrderBy
          testimonialsOrder
          ctaurl1 { url title target }
          ctaurl2 { url title target }

          testimonialsItems {
            nodes {
              ... on Testimonial {
                id
                databaseId
                uri
                title
                featuredImage { node { mediaItemUrl sourceUrl altText } }

                testimonialsFields: testimonialsfields {
                  starranking
                  kicker
                  title
                  excerpt
                  content
                  fullname
                  companyname
                  typeofbusiness
                  singlereviewlink { url title target }
                  linktogooglereview { url title target }
                  testimonialvideolink
                }
              }
            }
          }
        }
      }
    }

    testimonials(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        databaseId
        uri
        title
        featuredImage { node { mediaItemUrl sourceUrl altText } }

        testimonialsFields: testimonialsfields {
          starranking
          kicker
          title
          excerpt
          content
          fullname
          companyname
          typeofbusiness
          singlereviewlink { url title target }
          linktogooglereview { url title target }
          testimonialvideolink
        }
      }
    }
  }
`;


/* ---------- CTA (Home section) ---------- */
export const CTA_HOME_PAGE_QUERY = gql`
  query CtaHome($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        ctaSection {
          showCtaSection
          backgroundImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          title
          subtitle
          content
          ctaImage { node { mediaItemUrl sourceUrl altText } }
          ctaurl1 { url title target }
          ctaurl2 { url title target }
        }
      }
    }
  }
`;


/* ---------- Contact (Home section) ---------- */
export const CONTACT_HOME_PAGE_QUERY = gql`
  query ContactHome($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      id
      homePageFields {
        contact {
          showContact
          contactBgImage { node { mediaItemUrl sourceUrl altText } }
          kicker
          contactTitle
          contactSubtitle
          contactContent
          useGlobalContact
          contactimage { node { mediaItemUrl sourceUrl altText } }
        }
      }
    }
  }
`;


/* ---------- Generic Pages ---------- */
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

/* ---------- Example Singles ---------- */
export const SERVICE_QUERY = gql`
  query Service($slug: ID!) {
    service(id: $slug, idType: SLUG) {
      title
      content
      uri
      featuredImage { node { mediaItemUrl } }
      seo { title metaDesc }
    }
  }
`

export const PROJECT_QUERY = gql`
  query Project($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title
      content
      uri
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
        address
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

/* ---------- Menus by Location ---------- */
export const MAIN_MENU_BY_LOCATION = gql`
  query MainMenuByLocation {
    menuItems(first: 100, where: { location: PRIMARY }) {
      nodes { id databaseId label url parentId order }
    }
  }
`

export const FOOTER_MENU_BY_LOCATION = gql`
  query FooterMenuByLocation {
    menuItems(first: 100, where: { location: FOOTER }) {
      nodes { id databaseId label url parentId order }
    }
  }
`

/* ---------- Front page discovery (optional) ---------- */
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
