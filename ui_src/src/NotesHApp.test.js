import React from 'react'
import { render } from '@testing-library/react'
import NotesHApp from './NotesHApp'

test('renders learn react link', () => {
  const { getByText } = render(<NotesHApp />)
  const divElement = getByText(/Notes hApp/i)
  expect(divElement).toBeInTheDocument()
})
