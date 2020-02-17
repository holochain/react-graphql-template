use holochain_json_derive::DefaultJson; 
use hdk::holochain_persistence_api::cas::content::Address;
use serde_derive::{Deserialize, Serialize};
use hdk::{
    self,
    entry,
    from,
    link,
    entry_definition::ValidatingEntryType,
    holochain_core_types::{
        dna::entry_types::Sharing,
    },
    holochain_json_api::{
        json::JsonString,
        error::JsonError,
    },
};
pub mod handlers;
pub mod validation;
const NOTE_ENTRY_NAME: &str = "note";
const NOTE_LINK_TYPE: &str = "note_revisions";
const NOTE_ANCHOR_TYPE: &str = "note";
// const NOTES_LINK_TAG: &str = "notes";
const NOTES_ANCHOR_TYPE: &str = "notes";
const NOTES_ANCHOR_TEXT: &str = "notes";


/// Used for GraphQL to create or revise a note
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteInput {
    title: String,
    content: String,
}

/// The entry committed
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteEntry {
    content: String,
}

impl NoteEntry {
    pub fn from_input(note_input: &NoteInput) -> NoteEntry {
        return NoteEntry{
            content: note_input.content.clone(),
        }
    }
}

/// Aggregate note used in the UI
/// anchor is the stable identifier for GraphQL caching
/// timestamps come from headers
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    anchor: Address,
    created_at: u32,
    title: String,
    content: String,
}

impl Note {
    pub fn from_result(anchor: &Address, created_at: &u32, title: &String, content: &String) -> Note {
        return Note{
            anchor: anchor.to_owned(),
            created_at: created_at.to_owned(),
            title: title.to_owned(),
            content: content.to_owned(),
        }
    }
}

pub fn definition() -> ValidatingEntryType {
    entry!(
        name: "note",
        description: "this is a same entry defintion",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | validation_data: hdk::EntryValidationData<NoteEntry>| {
            match validation_data
            {
                hdk::EntryValidationData::Create{entry: _,validation_data: _} =>
                {
                    Ok(())
                },
                hdk::EntryValidationData::Modify{new_entry: _, old_entry: _, old_entry_header:_, validation_data: _} =>
                {
                   Ok(())
                },
                hdk::EntryValidationData::Delete{old_entry: _, old_entry_header: _, validation_data: _} =>
                {
                   Ok(())
                }
            }
        },
        links: [
            from!(
                holochain_anchors::ANCHOR_TYPE,
                link_type: NOTE_LINK_TYPE,
                validation_package: || {
                    hdk::ValidationPackageDefinition::Entry
                },

                validation: |_validation_data: hdk::LinkValidationData| {
                    Ok(())
                }
            )
        ]
    )
}
