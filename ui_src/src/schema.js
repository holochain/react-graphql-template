import gql from 'graphql-tag'

export default gql`

type Note {
  id: ID
  createdAt: String
  title: String
  content: String
}

input NoteInput {
  "{label: Title, help: Description of what the title is for, ui: <hc-title>, data: {create: Title of new Note, update: Updated title of Note}}"
  title: String!
  "{label: Content, help: Something to help the player, ui: <hc-text-area>, data: {create: Content of new Note, update: Updated content of Note}}"
  content: String
}

type Query {
  getNote(id: String): Note
  listNotes: [Note]
}

type Mutation {
  createNote(noteInput: NoteInput): Note
  updateNote(id: String, noteInput: NoteInput): Note
  removeNote(id: String): Note
}
`
