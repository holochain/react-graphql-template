module.exports = (scenario, conductorConfig) => {
  scenario("create_note", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    // Make a call to a Zome function
    // indicating the function, and passing it an input
    const create_note_result = await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    // Wait for all network activity to settle
    await s.consistency()
    const get_note_result = await bob.call("notes", "notes", "get_note", {"id": create_note_result.Ok.id})
    t.deepEqual(create_note_result, get_note_result)
    t.deepEqual(get_note_result.Ok.title, 'Title first note')
    t.deepEqual(get_note_result.Ok.content, 'Content first note')
  })

  scenario("update_note", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    const create_note_result = await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    const update_note_result = await alice.call("notes", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
    await s.consistency()
    const get_note_result = await alice.call("notes", "notes", "get_note", {"id": create_note_result.Ok.id})
    t.deepEqual(update_note_result, get_note_result)
    t.deepEqual(get_note_result.Ok.id, create_note_result.Ok.id)
    t.deepEqual(get_note_result.Ok.title, 'Updated title first note')
    t.deepEqual(get_note_result.Ok.content, 'Updated content first note')

    const update_note_result_2 = await alice.call("notes", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated again title first note", "content":"Updated again content first note"}})
    await s.consistency()
    const get_note_result_2 = await bob.call("notes", "notes", "get_note", {"id": create_note_result.Ok.id})
    t.deepEqual(update_note_result_2, get_note_result_2)
    t.deepEqual(get_note_result_2.Ok.id, create_note_result.Ok.id)
    t.deepEqual(get_note_result_2.Ok.title, 'Updated again title first note')
    t.deepEqual(get_note_result_2.Ok.content, 'Updated again content first note')
  })

  scenario("validate_entry_modify", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    const create_note_result = await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    await s.consistency()
    const updated_note_result = await bob.call("notes", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
    await s.consistency()
    let err = JSON.parse(updated_note_result.Err.Internal)
    t.deepEqual(err.kind, {"ValidationFailed":"Agent who did not author is trying to update"})
  })

  scenario("remove_note", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    const create_note_result = await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    await s.consistency()
    const list_notes_result = await bob.call("notes", "notes", "list_notes", {})
    t.deepEqual(list_notes_result.Ok.length, 1)
    const remove_note_result = await alice.call("notes", "notes", "remove_note", { "id": create_note_result.Ok.id })
    const list_notes_result_2 = await bob.call("notes", "notes", "list_notes", {})
    t.deepEqual(list_notes_result_2.Ok.length, 0)
  })

  scenario("validate_entry_delete", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    const create_note_result = await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    await s.consistency()
    const deleted_result = await bob.call("notes", "notes", "remove_note", { "id": create_note_result.Ok.id })
    let err = JSON.parse(deleted_result.Err.Internal)
    t.deepEqual(err.kind, {"ValidationFailed":"Agent who did not author is trying to delete"})
  })

  scenario("list_notes", async (s, t) => {
    const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
    await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
    await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title second note", "content":"Content second note"}})
    await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title third note", "content":"Content third note"}})
    await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title fourth note", "content":"Content fourth note"}})
    await s.consistency()
    const result = await alice.call("notes", "notes", "list_notes", {})
    t.deepEqual(result.Ok.length, 4)
  })
}
