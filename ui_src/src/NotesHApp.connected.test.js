import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import { ApolloProvider } from '@apollo/react-hooks'
import { renderAndWait } from './utils'
import NotesHApp from './NotesHApp'
import apolloClient from './apolloClient'
import mockData from './mock-dnas/mockData'
import wait from 'waait'

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
  const { getByText, getAllByText, getAllByTestId, getByTestId } = await renderAndWait(<ApolloProvider client={apolloClient}>
    <NotesHApp />
  </ApolloProvider>)

  const titleField = getByTestId('title-field')
  const contentField = getByTestId('content-field')
  const submitButton = getByText('Submit')

  console.log('submitbuttons', getAllByText('Submit').length)

  const newTitle = 'the new note title'
  const newContent = 'the new note content'

  await act(async () => {
    fireEvent.change(titleField, { target: { value: newTitle } })
    fireEvent.change(contentField, { target: { value: newContent } })
    fireEvent.click(submitButton)
    wait(1000)
  })

  console.log('number of notes', getAllByTestId('note-card').length)

  expect(getByText(newTitle)).toBeInTheDocument()
  expect(getByText(newContent)).toBeInTheDocument()
})
