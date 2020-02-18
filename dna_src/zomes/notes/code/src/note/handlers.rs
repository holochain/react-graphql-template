// use std::convert::TryFrom;
// use serde_json::json;
use hdk::error::ZomeApiResult;
// use hdk::error::ZomeApiError;
use hdk::holochain_core_types::{
    entry::Entry,
    time::Timeout,
    time::Iso8601
};
use hdk::holochain_persistence_api::cas::content::{
    Address,
    AddressableContent
};
use hdk::prelude::LinkMatch;
use hdk::prelude::GetEntryOptions;
use hdk::prelude::GetEntryResult;
use hdk::prelude::GetEntryResultType::Single;
use hdk::prelude::StatusRequestKind;
use holochain_anchors::anchor;
// use crate::note::NoteAnchorText;
use crate::note::NoteEntry;
use crate::note::Note;
use crate::note;

fn notes_anchor() -> ZomeApiResult<Address> {
    anchor(note::NOTES_ANCHOR_TYPE.to_string(), note::NOTES_ANCHOR_TEXT.to_string())
}

fn get_entry_result(address: Address) -> ZomeApiResult<GetEntryResult> {
    let options = GetEntryOptions{status_request: StatusRequestKind::Latest, entry: false, headers: true, timeout: Timeout::new(10000)};
    hdk::get_entry_result(&address, options)
}

fn timestamp(entry_result: GetEntryResult) -> Iso8601 {
    match entry_result.result {
        Single(entry) => {
            hdk::debug(format!("single_entry_timestamp: {:?}", entry.headers[0].timestamp())).ok();
            entry.headers[0].timestamp().clone()
        },
        _ => {
            hdk::debug(format!("not_single_entry")).ok();
            Iso8601::new(0,0)
        }
    }
}

pub fn create_note(note_entry: NoteEntry) -> ZomeApiResult<Note> {
    hdk::debug(format!("create_note: {:?}", note_entry)).ok();
    let entry = Entry::App(note::NOTE_ENTRY_NAME.into(), note_entry.clone().into());
    let address = hdk::commit_entry(&entry)?;
    let entry_result = get_entry_result(address.clone())?;
    hdk::link_entries(&notes_anchor()?, &address, note::NOTE_LINK_TYPE, "")?;
    let note = note::Note::from_result(&address, &timestamp(entry_result), &note_entry.title, &note_entry.content);
    Ok(note)
}

pub fn get_note(id: Address) -> ZomeApiResult<Note> {
    let entry_result = get_entry_result(id.clone())?;
    let note: NoteEntry = hdk::utils::get_as_type(id.clone())?;
    let note = note::Note::from_result(&id, &timestamp(entry_result), &note.title, &note.content);
    Ok(note)
}

pub fn update_note(id: Address, note_input: NoteEntry) -> ZomeApiResult<Note> {
    // let entry = hdk::get_entry(&id.clone())?;
    let address = match hdk::get_entry(&id.clone())? {
        None => id.clone(),
        Some(entry) => entry.address()
    };
    hdk::update_entry(Entry::App(note::NOTE_ENTRY_NAME.into(), note_input.clone().into()), &address)?;
    get_note(id.clone())
}

pub fn remove_note(id: Address) -> ZomeApiResult<Address> {
    hdk::remove_link(&notes_anchor()?, &id, note::NOTE_LINK_TYPE, "")?;
    hdk::remove_entry(&id)
}

pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::get_links_and_load(&notes_anchor()?, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)
        .map(|note_list|{
            note_list.into_iter()
                .filter_map(Result::ok)
                .flat_map(|entry| {
                    let id = entry.address();
                    hdk::debug(format!("list_entry{:?}", entry)).ok();
                    get_note(id)
                }).collect()
        })
}
