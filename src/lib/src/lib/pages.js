// src/lib/pages.js
import { gql } from '@apollo/client'

export const PAGE_BY_URI = gql`
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      content
      uri
    }
  }
`

export const ALL_PAGE_URIS = gql`
  query AllPageUris($first:Int=1000) {
    pages(first:$first, where:{status:PUBLISH}) {
      nodes { uri }
    }
  }
`
