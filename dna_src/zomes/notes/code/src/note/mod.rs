// use uuid::Uuid;
use holochain_json_derive::DefaultJson; 
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
pub struct NoteSpec {
    title: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    uuid: String,
    title: String,
    content: String,
}

impl Note {
    pub fn from_spec(spec: &NoteSpec, uuid: &String) -> Note {
        return Note{
            uuid: uuid.to_owned(),
            title: spec.title.clone(),
            content: spec.content.clone(),
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
        validation: | _validation_data: hdk::EntryValidationData<Note>| {
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
