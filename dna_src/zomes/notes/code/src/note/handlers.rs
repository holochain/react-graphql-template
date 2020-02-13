use hdk::error::ZomeApiResult;
use hdk::holochain_core_types::entry::Entry;
use hdk::holochain_persistence_api::cas::content::{
    Address,
    AddressableContent
};
use hdk::prelude::LinkMatch;
use holochain_anchors::anchor;
use std::convert::TryFrom;
use crate::note::NoteSpec;
use crate::note::NoteEntry;
use crate::note::Note;
use crate::note;

pub fn create_note(note_spec: NoteSpec) -> ZomeApiResult<Note> {
    hdk::debug(format!("create_note: {:?}", note_spec)).ok();
    let id: Address = note_spec.created_at.to_string().into();
    let note_entry = note::NoteEntry::from_spec(&note_spec, &id.to_string());
    let entry = Entry::App(note::NOTE_ENTRY_NAME.into(), note_entry.clone().into());
    let address = hdk::commit_entry(&entry)?;
    hdk::link_entries(&anchor(note::NOTE_ANCHOR_TYPE.to_string(), note::NOTE_ANCHOR_TEXT.to_string())?, &address, note::NOTE_LINK_TYPE, "")?;
    let note = note::Note::from_entry(&note_entry, &address);
    Ok(note)
}

pub fn get_note(address: Address) -> ZomeApiResult<Note> {
    let note_entry = hdk::utils::get_as_type(address.clone())?;
    let note = note::Note::from_entry(&note_entry, &address);
    Ok(note)
}

pub fn update_note(note: Note) -> ZomeApiResult<Note> {
    let note_entry = note::NoteEntry::from_note(&note);
    let updated_address = hdk::update_entry(Entry::App(note::NOTE_ENTRY_NAME.into(), note_entry.clone().into()), &note.address)?;
    let note = note::Note::from_entry(&note_entry, &updated_address);
    Ok(note)
}

pub fn remove_note(address: Address) -> ZomeApiResult<Address> {
    hdk::remove_entry(&address)
}

pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::get_links_and_load(&anchor(note::NOTE_ANCHOR_TYPE.to_string(),
    note::NOTE_ANCHOR_TEXT.to_string())?, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)
        .map(|note_list|{
            note_list.into_iter()
                .filter_map(Result::ok)
                .flat_map(|entry| {
                    let address = entry.address();
                    if let Entry::App(_, value) = entry {
                        NoteEntry::try_from(value)
                            .ok()
                            .map(|note_entry| note::Note::from_entry(&note_entry, &address))
                    } else {
                        None
                    }
                }).collect()
        })
}
