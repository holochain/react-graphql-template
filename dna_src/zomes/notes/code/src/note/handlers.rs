use std::convert::TryFrom;
use serde_json::json;
use hdk::error::ZomeApiResult;
use hdk::error::ZomeApiError;
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
use hdk::prelude::GetEntryResultType::Single;
use hdk::prelude::StatusRequestKind;
use holochain_anchors::anchor;
use crate::note::NoteAnchorText;
use crate::note::NoteInput;
use crate::note::NoteEntry;
use crate::note::Note;
use crate::note;

fn notes_anchor() -> ZomeApiResult<Address> {
    anchor(note::NOTES_ANCHOR_TYPE.to_string(), note::NOTES_ANCHOR_TEXT.to_string())
}

pub fn create_note(note_input: NoteInput) -> ZomeApiResult<Note> {
    hdk::debug(format!("create_note: {:?}", note_input)).ok();

    let entry = Entry::App(note::NOTE_ENTRY_NAME.into(), NoteEntry::from_input(&note_input).into());
    let address = hdk::commit_entry(&entry)?;
    let options = GetEntryOptions{status_request: StatusRequestKind::Latest, entry: false, headers: true, timeout: Timeout::new(10000)};
    let entry_result = hdk::get_entry_result(&address, options)?;

    hdk::debug(format!("entry_result: {:?}", entry_result.result)).ok();
    let created_at: Iso8601 = match entry_result.result {
        Single(entry) => {
            hdk::debug(format!("single_entry_timestamp: {:?}", entry.headers[0].timestamp())).ok();
            entry.headers[0].timestamp().clone()
        },
        _ => {
            hdk::debug(format!("not_single_entry")).ok();
            Iso8601::new(0,0)
        }
    };
    let anchor_text = NoteAnchorText{title: note_input.title.clone(), created_at: created_at.clone()};
    let note_anchor = anchor(note::NOTE_ANCHOR_TYPE.to_string(), json!(anchor_text).to_string())?;
    hdk::link_entries(&notes_anchor()?, &note_anchor, holochain_anchors::ANCHOR_ANCHOR_LINK_TYPE, "")?;
    hdk::link_entries(&note_anchor, &address, note::NOTE_LINK_TYPE, "")?;
    let note = note::Note::from_result(&note_anchor, &created_at, &note_input.title, &note_input.content);
    Ok(note)
}

pub fn get_note(title: String, created_at:Iso8601) -> ZomeApiResult<Note> {
    //  hdk::api::get_links_with_options
    // SortOrder desc
    // Pagination 0 or 1
    let anchor_text = NoteAnchorText{title: title.clone(), created_at: created_at.clone()};
    let note_anchor = anchor(note::NOTE_ANCHOR_TYPE.to_string(), json!(anchor_text).to_string())?;
    let notes: Vec<Note> = hdk::get_links_and_load(&note_anchor, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)
            .map(|note_revisions_list|{
                note_revisions_list.into_iter()
                    .filter_map(Result::ok)
                    .flat_map(|entry| {
                        // let address = entry.address();
                        if let Entry::App(_, value) = entry {
                            NoteEntry::try_from(value)
                                .ok()
                                .map(|note_entry| note::Note::from_result(&note_anchor, &created_at, &title, &note_entry.content))
                        } else {
                            None
                        }
                    }).collect()
            })?;
    let note = notes[0].clone();
    Ok(note)
}

fn get_note_from_anchor_address(note_anchor: Address) -> ZomeApiResult<Note> {
    let anchor = holochain_anchors::get_anchor(note_anchor)?;
    let anchor_text = anchor.anchor_text.ok_or_else(||ZomeApiError::Internal("reason".to_string()))?;
    let note_anchor_text: NoteAnchorText = serde_json::from_str(&anchor_text).map_err(|e| ZomeApiError::Internal(format!("{:?}", e)))?;
    get_note(note_anchor_text.title, note_anchor_text.created_at)
}
// //
// // pub fn revise_note(note_input: NoteInput) -> ZomeApiResult<Note> {
// // If update title then have to redo all links to new anchor
// // remove links to old title anchor
// // remove old title anchor
//
// pub fn update_note(anchor: Address, note_input: NoteInput) -> ZomeApiResult<Note> {
//
//     // get addrss of Noteinput see if it matches address
//     // if not its a new title
//     let note_revision_address = &hdk::get_links(&anchor, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)?.addresses().to_owned()[0];
//     let update_entry = note::NoteEntry::from_input(&note_input);
//     hdk::update_entry(Entry::App(note::NOTE_ENTRY_NAME.into(), update_entry.clone().into()), &note_revision_address)?;
//     // adda new link here to new updated address
//     // remove the old link if you dont want history of the entry
//     let created_at: u32 = 1222222222;
//     let note = note::Note::from_result(&anchor, &created_at, &note_input.title, &note_input.content);
//     Ok(note)
// }
//
// pub fn remove_note(anchor: Address) -> ZomeApiResult<Address> {
//
//     // Just remove link to notes anchor
//
//     let _note_revision_address = &hdk::get_links(&anchor, LinkMatch::Exactly(note::NOTE_LINK_TYPE), LinkMatch::Any)?.addresses().to_owned()[0];
//     // hdk::remove_link(&notes_anchor()?, &anchor, holochain_anchors::ANCHOR_ANCHOR_LINK_TYPE, "")?;
//     // hdk::remove_link(&anchor, &note_revision_address, note::NOTE_LINK_TYPE, "")?;
//     // hdk::remove_entry(&note_revision_address)?;
//     hdk::remove_entry(&anchor)
// }
//
pub fn list_notes() -> ZomeApiResult<Vec<Note>> {
    hdk::get_links_and_load(&notes_anchor()?, LinkMatch::Exactly(holochain_anchors::ANCHOR_ANCHOR_LINK_TYPE), LinkMatch::Any)
        .map(|note_list|{
            note_list.into_iter()
                .filter_map(Result::ok)
                .flat_map(|entry| {
                    let anchor = entry.address();
                    hdk::debug(format!("anchor_list_entry{:?}", entry)).ok();
                    get_note_from_anchor_address(anchor)
                }).collect()
        })
}
