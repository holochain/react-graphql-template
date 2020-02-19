// data is a tree organized by instanceId > zome > function
// leaves can either be an object, or a function which is called with the zome call args.
// See mockCallZome.js

const noteEntries = {
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress01: {
    id: '1',
    created_at: '1581553349996',
    title: 'First note',
    content: 'This is the earliest note created'
  },
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress02: {
    id: '2',
    created_at: '1581553400796',
    title: 'Middle note',
    content: 'Created after First note but before Latest note'
  },
  QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress03: {
    id: '3',
    created_at: '1581553434263',
    title: 'Latest note',
    content: 'The most recently created note'
  }
}

const data = {
  notes: {
    notes: {
      create_note: ({ note_input: noteInput }) => {
        const id = Object.keys(noteEntries).length + 1
        const address = 'QmRccTDUM1UcJWuxW3aMjfYkSBFmhBnGtgB7lAddress0' + id
        noteEntries[address] = { id, ...noteInput }
        return {
          id,
          address,
          created_at: String(Date.now()),
          ...noteInput
        }
      },

      get_note: ({ address }) => {
        const noteEntry = noteEntries[address]
        if (!noteEntry) throw new Error(`Can't find note with address ${address}`)
        return {
          address,
          ...noteEntry
        }
      },

      update_note: ({ address, note_input: noteInput }) => {
        const noteOriginalResult = data.notes.notes.get_note({ address })
        noteEntries[address] = { ...noteOriginalResult, ...noteInput }
        return {
          ...noteOriginalResult,
          ...noteInput
        }
      },

      remove_note: ({ address }) => {
        const removedNote = data.notes.notes.get_note({ address })
        delete noteEntries[address]
        return removedNote
      },

      list_notes: () => Object.keys(noteEntries)
        .map(key => ({
          address: key,
          ...noteEntries[key]
        }))
        .sort((a, b) => a.created_at > b.created_at ? -1 : 1)
    }
  }
}

export default data
