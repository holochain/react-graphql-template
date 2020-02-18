#![feature(proc_macro_hygiene)]
use serde_derive::{Deserialize, Serialize};
// use hdk::holochain_core_types::{
//     time::Iso8601
// };
use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
};
use hdk::holochain_persistence_api::cas::content::Address;
use hdk_proc_macros::zome;
use crate::note::NoteEntry;
use crate::note::Note;
pub mod note;
// see https://developer.holochain.org/api/0.0.42-alpha5/hdk/ for info on using the hdk library
// This is a sample zome that defines an entry type "note::Note" that can be committed to the
// agent's chain via the exposed function create_my_entry

#[zome]
mod notes {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    #[entry_def]
    fn anchor_def() -> ValidatingEntryType {
        holochain_anchors::anchor_definition()
    }

    #[entry_def]
     fn note_def() -> ValidatingEntryType {
        note::definition()
    }

    #[zome_fn("hc_public")]
    fn create_note(note_input: NoteEntry) -> ZomeApiResult<Note> {
        note::handlers::create_note(note_input)
    }

    #[zome_fn("hc_public")]
    fn get_note(id: Address) -> ZomeApiResult<Note> {
        note::handlers::get_note(id)
    }

    #[zome_fn("hc_public")]
    fn update_note(id: Address, note_input: NoteEntry) -> ZomeApiResult<Note> {
        note::handlers::update_note(id, note_input)
    }

    #[zome_fn("hc_public")]
    fn remove_note(id: Address) -> ZomeApiResult<Address> {
        note::handlers::remove_note(id)
    }

    #[zome_fn("hc_public")]
    fn list_notes() -> ZomeApiResult<Vec<Note>> {
        note::handlers::list_notes()
    }
}
