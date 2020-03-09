import { ApolloClient } from 'apollo-client'
import { SchemaLink } from 'apollo-link-schema'
import { makeExecutableSchema } from 'graphql-tools'
import apolloLogger from 'apollo-link-logger'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'

import typeDefs from './schema'
import resolvers from './resolvers'

const schemaLink = new SchemaLink({ schema: makeExecutableSchema({ typeDefs, resolvers }) })

var links = [schemaLink]

if (process.env.NODE_ENV !== 'test') {
  links = [apolloLogger].concat(links)
}

const link = ApolloLink.from(links)

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true
})

export default apolloClient
