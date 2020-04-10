use std::convert::TryFrom;
use hdk::{
    error::ZomeApiResult,
    holochain_core_types::{
        entry::Entry,
        time::Iso8601,
    },
    holochain_persistence_api::cas::content::{
        Address,
        AddressableContent,
    },
    prelude::*,
};
use holochain_anchors::anchor;
use crate::note::{
    NOTES_ANCHOR_TYPE,
    NOTES_ANCHOR_TEXT,
    // NOTE_ID_LINK_TYPE,
    // NOTE_ID_ENTRY_NAME,
    NOTE_ENTRY_LINK_TYPE,
    NOTE_ENTRY_NAME,
    // NoteId,
    NoteEntry,
    Note,
};

fn notes_anchor() -> ZomeApiResult<Address> {
    anchor(NOTES_ANCHOR_TYPE.to_string(), NOTES_ANCHOR_TEXT.to_string())
}

pub fn create_note(note_entry: NoteEntry) -> ZomeApiResult<Note> {
    let note_anchor = notes_anchor()?;
    let entry = Entry::App(NOTE_ENTRY_NAME.into(), note_entry.clone().into());
    let entry_address = hdk::commit_entry(&entry)?;
    // let note_id = NoteId::new(entry_address.clone())?;
    // let note_id_entry = Entry::App(NOTE_ID_ENTRY_NAME.into(), note_id.clone().into());
    // let note_id_address = hdk::commit_entry(&note_id_entry)?;
    // hdk::link_entries(&note_id_address, &entry_address, NOTE_ENTRY_LINK_TYPE, "")?;
    let note = Note::new(entry_address.clone(), note_entry)?;
    hdk::link_entries(&note_anchor, &entry_address, NOTE_ENTRY_LINK_TYPE, &note.created_at.to_string())?;
    Ok(note)
}

pub fn get_note(id: Address, created_at: Iso8601) -> ZomeApiResult<Note> {
    let note_entry: NoteEntry = hdk::utils::get_as_type(id.clone())?;
    let address = Entry::App(NOTE_ENTRY_NAME.into(), note_entry.clone().into()).address();
    Note::existing(id.clone(), created_at, address, note_entry)
}

pub fn update_note(id: Address, created_at: Iso8601, address: Address, note_input: NoteEntry) -> ZomeApiResult<Note> {
    let updated_entry_address = hdk::update_entry(Entry::App(NOTE_ENTRY_NAME.into(), note_input.clone().into()), &address.clone())?;
    Note::existing(id.clone(), created_at, updated_entry_address, note_input)
}

// pub fn remove_note(id: Address) -> ZomeApiResult<Address> {
//     if let Some(link) = hdk::get_links(&id, LinkMatch::Exactly(NOTE_ENTRY_LINK_TYPE), LinkMatch::Any)?.links().get(0) {
//         let entry_address = link.address.clone();
//         hdk::remove_link(&id, &entry_address, NOTE_ENTRY_LINK_TYPE, "")?;
//         hdk::remove_link(&notes_anchor()?, &id, NOTE_ID_LINK_TYPE, "")?;
//         hdk::remove_entry(&entry_address)?;
//         hdk::remove_entry(&id)
//     }
//     else {
//         Err(hdk::error::ZomeApiError::Internal("No Note at this address".to_string()))
//     }
// }

pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::get_links(&notes_anchor()?, LinkMatch::Exactly(NOTE_ENTRY_LINK_TYPE), LinkMatch::Any)?.links()
    .iter()
    .map(|link| get_note(link.address.clone(), Iso8601::try_from(link.tag.clone()).unwrap()))
    .collect()
}
