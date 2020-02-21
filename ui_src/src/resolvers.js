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
      dnaToUiNote(await createZomeCall('/reactGraphql/notes/get_note')({ id })),

    listNotes: async () =>
      (await createZomeCall('/reactGraphql/notes/list_notes')()).map(dnaToUiNote)
  },

  Mutation: {
    createNote: async (_, { noteInput }) =>
      dnaToUiNote(await createZomeCall('/reactGraphql/notes/create_note')({ note_input: noteInput })),

    updateNote: async (_, { id, noteInput }) =>
      dnaToUiNote(await createZomeCall('/reactGraphql/notes/update_note')({ id, note_input: noteInput })),

    removeNote: async (_, { id }) =>
      dnaToUiNote(await createZomeCall('/reactGraphql/notes/remove_note')({ id }))
  }
}

export default resolvers
