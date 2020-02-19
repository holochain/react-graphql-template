import { createZomeCall } from './holochainClient'

function dnaToUiNote (noteResult) {
  return {
    ...noteResult,
    createdAt: noteResult.created_at
  }
}

export const resolvers = {
  Query: {
    getNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/react-graphql/notes/get_note')({ id })),

    listNotes: async () =>
      (await createZomeCall('/react-graphql/notes/list_notes')()).map(dnaToUiNote)
  },

  Mutation: {
    createNote: async (_, { noteInput }) =>
      dnaToUiNote(await createZomeCall('/react-graphql/notes/create_note')({ note_input: noteInput })),

    updateNote: async (_, { id, noteInput }) =>
      dnaToUiNote(await createZomeCall('/react-graphql/notes/update_note')({ id, note_input: noteInput })),

    removeNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/react-graphql/notes/remove_note')({ id }))
  }
}

export default resolvers
