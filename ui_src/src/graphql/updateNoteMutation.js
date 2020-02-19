import gql from 'graphql-tag'

export default gql`
  mutation UpdateNote($address: String, $noteInput: NoteInput) {
    updateNote (address: $address, noteInput: $noteInput) {
      id
      address
      createdAt
      title
      content
    }
  }
`
