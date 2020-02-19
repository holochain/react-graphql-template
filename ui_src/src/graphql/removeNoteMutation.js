import gql from 'graphql-tag'

export default gql`
  mutation RemoveNote($address: String) {
    removeNote (address: $address) {
      id
      address
      createdAt
      title
      content
    }
  }
`
