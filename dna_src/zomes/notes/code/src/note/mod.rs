use serde_derive::{Deserialize, Serialize};
use holochain_json_derive::DefaultJson; 
use hdk::{
    self,
    entry,
    from,
    link,
    entry_definition::ValidatingEntryType,
    holochain_core_types::{
        dna::entry_types::Sharing,
        time::Iso8601
    },
    holochain_json_api::{
        json::JsonString,
        error::JsonError,
    },
    holochain_persistence_api::cas::content::Address
};

pub mod handlers;
pub mod validation;

const NOTE_ENTRY_NAME: &str = "note";
const NOTE_LINK_TYPE: &str = "note_link";
const NOTES_ANCHOR_TYPE: &str = "notes";
const NOTES_ANCHOR_TEXT: &str = "notes";

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoteEntry {
    title: String,
    content: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    id: Address,
    created_at: Iso8601,
    title: String,
    content: String,
}

impl Note {
    pub fn from_result(id: &Address, created_at: &Iso8601, title: &String, content: &String) -> Note {
        return Note{
            id: id.to_owned(),
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
                hdk::EntryValidationData::Create{entry, validation_data} =>
                {
                    validation::validate_entry_create(entry, validation_data)
                },
                hdk::EntryValidationData::Modify{new_entry, old_entry, old_entry_header, validation_data} =>
                {
                    validation::validate_entry_modify(new_entry, old_entry, old_entry_header, validation_data)
                },
                hdk::EntryValidationData::Delete{old_entry, old_entry_header, validation_data} =>
                {
                   validation::validate_entry_delete(old_entry, old_entry_header, validation_data)
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
                validation: |validation_data: hdk::LinkValidationData| {
                    match validation_data
                    {
                        hdk::LinkValidationData::LinkAdd{link, validation_data} =>
                        {
                            validation::validate_link_add(link, validation_data)
                        },
                        hdk::LinkValidationData::LinkRemove{link, validation_data} =>
                        {
                            validation::validate_link_remove(link, validation_data)
                        }
                    }
                }
            )
        ]
    )
}
