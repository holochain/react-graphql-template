import gql from 'graphql-tag'

export default gql`

type Note {
  id: ID  
  address: String
  createdAt: String
  title: String
  content: String
}

input NoteInput {
  createdAt: String
  title: String
  content: String
}

type Query {
  getNote(address: String): Note
  listNotes: [Note]
}

type Mutation {
  createNote(noteInput: NoteInput): Note
  updateNote(address: String, noteInput: NoteInput): Note
  removeNote(address: String): Note
}
`
