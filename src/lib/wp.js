import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

export const wp = new ApolloClient({
    link: new HttpLink({
        uri: process.env.WP_API_URL, // GraphQL endpoint מ־WordPress
    }),
    cache: new InMemoryCache(),
})
