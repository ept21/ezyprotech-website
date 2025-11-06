// lib/queries.js
import { gql } from 'graphql-request'

/* ---------- Hero (Home) ---------- */
/* Fetch only the hero slice from the Home page (by database ID). */
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

/* ---------- Example Single (kept for future wiring) ---------- */
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


/* ---------- Globals (brand + social + default assets) ---------- */
/* NOTE: "linkdine" is kept as-is to match current ACF field key. */
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


/* ---------- Menus by Location (no extra generalSettings here) ---------- */
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


/* ---------- Front page discovery (optional helper) ---------- */
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
