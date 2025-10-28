import 'server-only'
import { GraphQLClient } from 'graphql-request'

export const getClient = () =>
    new GraphQLClient(process.env.WP_GRAPHQL_ENDPOINT, { headers: {} })
