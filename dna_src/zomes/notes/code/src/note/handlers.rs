use std::convert::TryFrom;
use hdk::error::ZomeApiResult;
use hdk::holochain_core_types::entry::Entry;
use hdk::holochain_persistence_api::cas::content::{
    Address,
    AddressableContent
};
use hdk::prelude::LinkMatch;
use hdk::prelude::GetEntryOptions;
use holochain_anchors::anchor;

use crate::note::NoteInput;
use crate::note::NoteEntry;
use crate::note::Note;
use crate::note;

pub fn create_note(note_input: NoteInput) -> ZomeApiResult<Note> {
    hdk::debug(format!("create_note: {:?}", note_input)).ok();
    let notes_anchor = anchor(note::NOTES_ANCHOR_TYPE.to_string(), note::NOTES_ANCHOR_TEXT.to_string())?;
    let note_anchor = anchor(note::NOTE_ANCHOR_TYPE.to_string(), note_input.title.to_string())?;
    hdk::link_entries(&notes_anchor, &note_anchor, holochain_anchors::ANCHOR_ANCHOR_LINK_TYPE, "")?;

    let entry = Entry::App(note::NOTE_ENTRY_NAME.into(), NoteEntry::from_input(&note_input).into());
    let address = hdk::commit_entry(&entry)?;
    hdk::link_entries(&note_anchor, &address, note::NOTE_LINK_TYPE, "")?;

    let created_at: u32 = 1222222222;
    let note = note::Note::from_result(&note_anchor, &created_at, &note_input.title, &note_input.content);
    Ok(note)
}

pub fn get_note(anchor: Address) -> ZomeApiResult<Note> {
    let anchor_result = hdk::get_entry_result(&anchor, GetEntryOptions::default());
    hdk::debug(format!("anchor_result: {:?}", anchor_result)).ok();

    // let title_result= hdk::get_entry(anchor)?.ok();
    // let title = title_result.anchor_text;

    let created_at: u32 = 1222222222;
    let notes: Vec<Note> = hdk::get_links_and_load(&anchor, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)
            .map(|note_revisions_list|{
                note_revisions_list.into_iter()
                    .filter_map(Result::ok)
                    .flat_map(|entry| {
                        // let address = entry.address();
                        if let Entry::App(_, value) = entry {
                            NoteEntry::try_from(value)
                                .ok()
                                .map(|note_entry| note::Note::from_result(&anchor, &created_at, &"title".to_string(), &note_entry.content))
                        } else {
                            None
                        }
                    }).collect()
            })?;
    let note = notes[0].clone();
    Ok(note)
}
//
pub fn update_note(anchor: Address, note_input: NoteInput) -> ZomeApiResult<Note> {
    let note_revision_address = &hdk::get_links(&anchor, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)?.addresses().to_owned()[0];
    let update_entry = note::NoteEntry::from_input(&note_input);
    hdk::update_entry(Entry::App(note::NOTE_ENTRY_NAME.into(), update_entry.clone().into()), &note_revision_address)?;
    let created_at: u32 = 1222222222;
    let note = note::Note::from_result(&anchor, &created_at, &note_input.title, &note_input.content);
    Ok(note)
}
//
// pub fn remove_note(address: Address) -> ZomeApiResult<Address> {
//     hdk::remove_entry(&address)
// }
//
pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::get_links_and_load(&anchor(note::NOTES_ANCHOR_TYPE.to_string(),
    note::NOTES_ANCHOR_TEXT.to_string())?, LinkMatch::Exactly(holochain_anchors::ANCHOR_ANCHOR_LINK_TYPE), LinkMatch::Any)
        .map(|note_list|{
            note_list.into_iter()
                .filter_map(Result::ok)
                .flat_map(|entry| {
                    let anchor = entry.address();
                    get_note(anchor)
                }).collect()
        })
}
