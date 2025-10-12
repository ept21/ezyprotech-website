// src/lib/menu.js
import { gql } from '@apollo/client'
import { wp } from '@/lib/wp'

const MENU_PRIMARY = gql`
  query PrimaryMenu {
    menuItems(where: { location: PRIMARY }, first: 100) {
      nodes { id label uri parentId }
    }
  }
`

export async function getPrimaryMenu() {
    const { data } = await wp.query({ query: MENU_PRIMARY, fetchPolicy: 'no-cache' })
    const nodes = data?.menuItems?.nodes ?? []
    return { items: nodes }
}
