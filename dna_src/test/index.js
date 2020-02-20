/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example
const path = require('path')

const { Orchestrator, Config, combine, singleConductor, localOnly, tapeExecutor } = require('@holochain/tryorama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/dna_src.dna.json")

const orchestrator = new Orchestrator({
  middleware: combine(
    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require('tape')),

    // specify that all "players" in the test are on the local machine, rather than
    // on remote machines
    localOnly,

    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
    singleConductor,
  )
})

const dna = Config.dna(dnaPath, 'note-test')
const conductorConfig = Config.gen({reactGraphql: dna})
// const conductorConfig = Config.gen({reactGraphql: dna}, {
//   network: {
//     type: 'sim2h',
//     sim2h_url: 'ws://localhost:9000'
//   }
// })

orchestrator.registerScenario("create_note", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const create_note_result = await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  // Wait for all network activity to settle
  await s.consistency()
  const get_note_result = await bob.call("reactGraphql", "notes", "get_note", {"id": create_note_result.Ok.id})
  t.deepEqual(create_note_result, get_note_result)
  t.deepEqual(get_note_result.Ok.title, 'Title first note')
  t.deepEqual(get_note_result.Ok.content, 'Content first note')
})

orchestrator.registerScenario("update_note", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  const create_note_result = await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  const update_note_result = await alice.call("reactGraphql", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
  await s.consistency()
  const get_note_result = await alice.call("reactGraphql", "notes", "get_note", {"id": create_note_result.Ok.id})
  t.deepEqual(update_note_result, get_note_result)
  t.deepEqual(get_note_result.Ok.id, create_note_result.Ok.id)
  t.deepEqual(get_note_result.Ok.title, 'Updated title first note')
  t.deepEqual(get_note_result.Ok.content, 'Updated content first note')

  const update_note_result_2 = await alice.call("reactGraphql", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated again title first note", "content":"Updated again content first note"}})
  await s.consistency()
  const get_note_result_2 = await bob.call("reactGraphql", "notes", "get_note", {"id": create_note_result.Ok.id})
  t.deepEqual(update_note_result_2, get_note_result_2)
  t.deepEqual(get_note_result_2.Ok.id, create_note_result.Ok.id)
  t.deepEqual(get_note_result_2.Ok.title, 'Updated again title first note')
  t.deepEqual(get_note_result_2.Ok.content, 'Updated again content first note')
})

orchestrator.registerScenario("validate_entry_modify", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  const create_note_result = await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  const updated_note_result = await bob.call("reactGraphql", "notes", "update_note", {"id": create_note_result.Ok.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
  await s.consistency()
  let err = JSON.parse(updated_note_result.Err.Internal)
  t.deepEqual(err.kind, {"ValidationFailed":"Agent who did not author is trying to update"})
})

orchestrator.registerScenario("remove_note", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  const create_note_result = await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  const list_notes_result = await bob.call("reactGraphql", "notes", "list_notes", {})
  t.deepEqual(list_notes_result.Ok.length, 1)
  const remove_note_result = await alice.call("reactGraphql", "notes", "remove_note", { "id": create_note_result.Ok.id })
  const list_notes_result_2 = await bob.call("reactGraphql", "notes", "list_notes", {})
  t.deepEqual(list_notes_result_2.Ok.length, 0)
})

orchestrator.registerScenario("validate_entry_delete", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  const create_note_result = await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  const deleted_result = await bob.call("reactGraphql", "notes", "remove_note", { "id": create_note_result.Ok.id })
  let err = JSON.parse(deleted_result.Err.Internal)
  t.deepEqual(err.kind, {"ValidationFailed":"Agent who did not author is trying to delete"})
})

orchestrator.registerScenario("list_notes", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title second note", "content":"Content second note"}})
  await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title third note", "content":"Content third note"}})
  await alice.call("reactGraphql", "notes", "create_note", {"note_input" : {"title":"Title fourth note", "content":"Content fourth note"}})
  await s.consistency()
  const result = await alice.call("reactGraphql", "notes", "list_notes", {})
  t.deepEqual(result.Ok.length, 4)
})

orchestrator.run()
