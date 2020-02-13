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

const NOTE_LINK_TYPE: &str = "note_link_to";
const NOTE_ENTRY_NAME: &str = "note";
const NOTE_ANCHOR_TYPE: &str = "notes";
const NOTE_ANCHOR_TEXT: &str = "my_notes";

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteInput {
    created_at: u32,
    title: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteEntry {
    id: String,
    created_at: u32,
    title: String,
    content: String,
}

impl NoteEntry {
    pub fn from_input(spec: &NoteInput, id: &String) -> NoteEntry {
        return NoteEntry{
            id: id.to_owned(),
            created_at: spec.created_at.clone(),
            title: spec.title.clone(),
            content: spec.content.clone(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    id: String,
    created_at: u32,
    title: String,
    content: String,
    address: Address,
}

impl Note {
    pub fn from_entry(note_entry: &NoteEntry, address: &Address) -> Note {
        return Note{
            id: note_entry.id.clone(),
            created_at: note_entry.created_at.clone(),
            title: note_entry.title.clone(),
            content: note_entry.content.clone(),
            address: address.to_owned(),
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
        validation: | _validation_data: hdk::EntryValidationData<NoteEntry>| {
            Ok(())
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
