import React from 'react'
import { fireEvent, act, within } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import { renderAndWait } from './utils'
import NotesHApp from './NotesHApp'
import apolloClient from './apolloClient'
import mockData from './mock-dnas/mockData'

const mockNoteEntries = mockData.notes.notes.list_notes()

it('lists notes', async () => {
  const { getAllByTestId } = await renderAndWait(<ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>)

  const noteCards = getAllByTestId('note-card')

  expect(noteCards.length).toEqual(mockNoteEntries.length)
})

it('can edit an existing note', async () => {
  const { getByText, getAllByText, getByDisplayValue } = await renderAndWait(<ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>)

  const editButtons = getAllByText('Edit')

  await act(async () => fireEvent.click(editButtons[0]))

  const newContent = 'this is the updated note content'

  await act(async () => fireEvent.change(getByDisplayValue(mockNoteEntries[0].content), { target: { value: newContent } }))

  const submitButtons = getAllByText('Submit')

  await act(async () => fireEvent.click(submitButtons[0]))

  expect(getByText(newContent)).toBeInTheDocument()
})

it('can create a new note', async () => {
  const { getByText, getByTestId } = await renderAndWait(<ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>)

  const titleField = getByTestId('title-field')
  const contentField = getByTestId('content-field')
  const submitButton = getByText('Submit')

  const newTitle = 'the new note title'
  const newContent = 'the new note content'

  await act(async () => {
    fireEvent.change(titleField, { target: { value: newTitle } })
    fireEvent.change(contentField, { target: { value: newContent } })
  })
  await act(async () => fireEvent.click(submitButton))

  expect(getByText(newTitle)).toBeInTheDocument()
  expect(getByText(newContent)).toBeInTheDocument()
})

it('can delete note', async () => {
  const { getByText, getAllByTestId, queryByText } = await renderAndWait(<ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>)

  const firstNoteTitle = mockNoteEntries[0].title
  var firstRemoveButton

  const noteCards = getAllByTestId('note-card')

  noteCards.forEach(noteCard => {
    const { getByText, queryByText } = within(noteCard)
    if (queryByText(firstNoteTitle)) {
      firstRemoveButton = getByText('Remove')
    }
  })

  expect(getByText(firstNoteTitle)).toBeInTheDocument()

  await act(async () => fireEvent.click(firstRemoveButton))

  expect(queryByText(firstNoteTitle)).not.toBeInTheDocument()
})
