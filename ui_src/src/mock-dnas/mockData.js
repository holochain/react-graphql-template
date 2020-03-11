// data is a tree organized by instanceId > zome > function
// leaves can either be an object, or a function which is called with the zome call args.
// See mockCallZome.js

export const noteEntries = {
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress01: {
    created_at: '1581553349996',
    title: 'First note',
    content: 'This is the earliest note created'
  },
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress02: {
    created_at: '1581553400796',
    title: 'Middle note',
    content: 'Created after First note but before Latest note'
  },
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress03: {
    created_at: '1581553434263',
    title: 'Latest note',
    content: 'The most recently created note'
  }
}

const data = {
  notes: {
    notes: {
      create_note: ({ note_input: noteInput }) => {
        const noteIndex = Object.keys(noteEntries).length + 1
        const id = 'QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress0' + noteIndex
        const createdAt = String(Date.now())
        noteEntries[id] = { id, ...noteInput, created_at: createdAt }
        return {
          id,
          created_at: createdAt,
          ...noteInput
        }
      },

      get_note: ({ id }) => {
        const noteEntry = noteEntries[id]
        if (!noteEntry) throw new Error(`Can't find note with id ${id}`)
        return {
          id,
          ...noteEntry
        }
      },

      update_note: ({ id, note_input: noteInput }) => {
        const noteOriginalResult = data.notes.notes.get_note({ id })
        noteEntries[id] = { ...noteOriginalResult, ...noteInput }
        return {
          ...noteOriginalResult,
          ...noteInput
        }
      },

      remove_note: ({ id }) => {
        const removedNote = data.notes.notes.get_note({ id })
        delete noteEntries[id]
        return removedNote
      },

      list_notes: () => Object.keys(noteEntries)
        .map(key => ({
          id: key,
          ...noteEntries[key]
        }))
        .sort((a, b) => a.created_at > b.created_at ? -1 : 1)
    }
  }
}

export default data
