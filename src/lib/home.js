import { gql } from '@apollo/client'
export const HOME_QUERY = gql`
  query HomePage {
    page(id: "/", idType: URI) {
      homepage {
        pageBuilder {
          __typename
          ... on Hero {
            eyebrow title subtitle
            primaryCtaText primaryCtaLink
            secondaryCtaText secondaryCtaLink
            bgImage { mediaItemUrl altText }
          }
          ... on LogoStrip { logos { text image { mediaItemUrl altText } } }
          ... on Features { items { title desc iconKey } }
          ... on ServicesGrid {
            services { nodes { id slug title excerpt featuredImage { node { mediaItemUrl altText } } } }
          }
          ... on ProjectsGrid {
            projects { nodes { id slug title excerpt featuredImage { node { mediaItemUrl altText } } } }
          }
          ... on Testimonials { items { quote author role avatar { mediaItemUrl altText } } }
          ... on Cta { title text ctaText ctaLink }
        }
      }
    }
  }
`
