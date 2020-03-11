import React from 'react'
import { renderAndWait } from './utils'
import { MockedProvider } from '@apollo/react-testing'
import NotesHApp from './NotesHApp'

it('renders "Notes hApp" title', async () => {
  const mocks = []
  const { getByText } = await renderAndWait(<MockedProvider mocks={mocks} addTypename={false}>
    <NotesHApp />
  </MockedProvider>)

  const divElement = getByText(/Notes hApp/i)
  expect(divElement).toBeInTheDocument()
})
