import React, { useState } from 'react'
import { pick } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import LIST_NOTES_QUERY from './graphql/listNotesQuery'
import CREATE_NOTE_MUTATION from './graphql/createNoteMutation'
import UPDATE_NOTE_MUTATION from './graphql/updateNoteMutation'
import REMOVE_NOTE_MUTATION from './graphql/removeNoteMutation'

import './NotesHApp.css'

function NotesHApp () {
  const { data: { listNotes } = { listNotes: [] } } = useQuery(LIST_NOTES_QUERY)

  const [createNote] = useMutation(CREATE_NOTE_MUTATION, { refetchQueries: [{ query: LIST_NOTES_QUERY }] })
  const [updateNote] = useMutation(UPDATE_NOTE_MUTATION)
  const [removeNote] = useMutation(REMOVE_NOTE_MUTATION, { refetchQueries: [{ query: LIST_NOTES_QUERY }] })

  // the id of the note currently being edited
  const [editingNoteId, setEditingNoteId] = useState()

  return <div className='notes-happ'>
    <h1>Notes hApp</h1>

    <NoteForm
      formAction={({ noteInput }) => createNote({ variables: { noteInput } })}
      formTitle='Create Note' />

    <div className='note-list'>
      {listNotes.map(note =>
        <NoteRow
          key={note.id}
          note={note}
          editingNoteId={editingNoteId}
          setEditingNoteId={setEditingNoteId}
          removeNote={removeNote}
          updateNote={updateNote} />)}
    </div>
  </div>
}

function NoteRow ({ note, editingNoteId, setEditingNoteId, updateNote, removeNote }) {
  const { id } = note

  if (id === editingNoteId) {
    return <NoteForm
      note={note}
      formTitle='Update Note'
      setEditingNoteId={setEditingNoteId}
      formAction={({ id, noteInput }) => updateNote({ variables: { id, noteInput } })} />
  }

  return <NoteCard note={note} setEditingNoteId={setEditingNoteId} removeNote={removeNote} />
}

function NoteCard ({ note: { id, title, content }, setEditingNoteId, removeNote }) {
  return <div className='note-card' data-testid='note-card'>
    <h3>{title}</h3>
    <div className='note-content'>{content}</div>
    <button className='button' onClick={() => setEditingNoteId(id)}>Edit</button>
    <button onClick={() => removeNote({ variables: { id } })}>Remove</button>
  </div>
}

function NoteForm ({ note = { title: '', content: '' }, formTitle, formAction, setEditingNoteId = () => {} }) {
  const [formState, setFormState] = useState(pick(['title', 'content'], note))
  const { title, content } = formState
  const { id } = note

  const setField = field => ({ target: { value } }) => setFormState(formState => ({
    ...formState,
    [field]: value
  }))

  const clearForm = () => {
    setFormState({
      title: '',
      content: ''
    })
  }

  const onSubmit = () => {
    formAction({
      id,
      noteInput: {
        ...formState
      }
    })
    setEditingNoteId(null)
    clearForm()
  }

  const onCancel = () => {
    setEditingNoteId(null)
    clearForm()
  }

  return <div className='note-form'>
    <h3>{formTitle}</h3>
    <div className='form-row'>
      <label htmlFor='title'>Title</label>
      <input id='title' name='title' value={title} onChange={setField('title')} />
    </div>
    <div className='form-row'>
      <label htmlFor='content'>Content</label>
      <textarea id='content' name='content' value={content} onChange={setField('content')} rows='6' />
    </div>
    <div>
      <button onClick={onSubmit}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  </div>
}

export default NotesHApp
