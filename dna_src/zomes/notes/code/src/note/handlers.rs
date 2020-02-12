// use uuid::Uuid;
use hdk::error::ZomeApiResult;
use hdk::holochain_core_types::entry::Entry;
use hdk::holochain_persistence_api::cas::content::Address;
use hdk::prelude::LinkMatch;
use holochain_anchors::anchor;
use crate::note::NoteSpec;
use crate::note::Note;
use crate::note;

pub fn create_note(note_spec: NoteSpec) -> ZomeApiResult<Address> {
    hdk::debug(format!("create_note: {:?}", note_spec)).ok();
    let note_uuid = "a uuid".to_string(); //Uuid::new_v4(); Doesnt work in WASM need to ask David Meister
    hdk::debug(format!("note_uuid: {:?}", note_uuid)).ok();
    let note = note::Note::from_spec(&note_spec, &note_uuid.to_string());
    hdk::debug(format!("Note Posted: {:?}", note)).ok();
    let entry = Entry::App(note::NOTE_ENTRY_NAME.into(), note.into());
    let address = hdk::commit_entry(&entry)?;
    hdk::link_entries(&anchor(note::NOTE_ANCHOR_TYPE.to_string(), note::NOTE_ANCHOR_TEXT.to_string())?, &address, note::NOTE_LINK_TYPE, "")?;
    Ok(address)
}

pub fn get_note(address: Address) -> ZomeApiResult<Note> {
    Ok(hdk::utils::get_as_type(address)?)
}

pub fn update_note(note: Note, address: Address) -> ZomeApiResult<Address> {
    Ok(hdk::update_entry(Entry::App(note::NOTE_ENTRY_NAME.into(), note.clone().into()), &address)?)
}

pub fn remove_note(address: Address) -> ZomeApiResult<Address> {
    hdk::remove_entry(&address)
}

pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::utils::get_links_and_load_type(&anchor(note::NOTE_ANCHOR_TYPE.to_string(), note::NOTE_ANCHOR_TEXT.to_string())?, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)
}
