import { gql } from '@apollo/client'

export const ALL_CATEGORIES = gql`
  query AllCategories($first:Int=100) {
    categories(first:$first) { nodes { id name slug uri } }
  }
`

export const ALL_TAGS = gql`
  query AllTags($first:Int=100) {
    tags(first:$first) { nodes { id name slug uri } }
  }
`

export const POSTS_BY_CATEGORY = gql`
  query PostsByCategory($slug:ID!, $first:Int=12) {
    category(id:$slug, idType:SLUG) {
      name slug uri
      posts(first:$first, where:{status:PUBLISH}) {
        nodes {
          id title slug excerpt date
          featuredImage { node { mediaItemUrl altText } }
          author { node { name } }
        }
      }
    }
  }
`

export const POSTS_BY_TAG = gql`
  query PostsByTag($slug:ID!, $first:Int=12) {
    tag(id:$slug, idType:SLUG) {
      name slug uri
      posts(first:$first, where:{status:PUBLISH}) {
        nodes {
          id title slug excerpt date
          featuredImage { node { mediaItemUrl altText } }
          author { node { name } }
        }
      }
    }
  }
`
