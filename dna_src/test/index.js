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
  ),
})

const dna = Config.dna(dnaPath, 'note-test')
const conductorConfig = Config.gen({myInstanceName: dna})

orchestrator.registerScenario.only("Create a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})

  // Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: address")
  console.log(note_result)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"title": note_result.Ok.title, "created_at": note_result.Ok.createdAt})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.title, 'Title first note')
  t.deepEqual(result.Ok.content, 'Content first note')

  // lauch UIs
})

orchestrator.registerScenario("Update a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  let note = note_result.Ok
  console.log("create_note: ")
  console.log(note_result)
  const updated_note_result = await alice.call("myInstanceName", "notes", "update_note", {"anchor": note.anchor, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
// Wait for all network activity to settle
  await s.consistency()

  console.log("update_note: ")
  console.log(updated_note_result)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"anchor": updated_note_result.Ok.anchor})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  // t.deepEqual(result.Ok.title, 'Updated title first note')
  t.deepEqual(result.Ok.content, 'Updated content first note')
})

orchestrator.registerScenario("Remove a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  const deleted_address = await alice.call("myInstanceName", "notes", "remove_note", { "anchor": note_result.Ok.anchor })
// Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: ")
  console.log(note_result)
  console.log("delete_note: address")
  console.log(deleted_address)
  // const result = await bob.call("myInstanceName", "notes", "get_note", {"anchor": note_result.Ok.anchor})
  const result = await bob.call("myInstanceName", "notes", "get_note", {"anchor": deleted_address.Ok})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result, { Err: { Internal: 'No entry at this address' } })
})

orchestrator.registerScenario.only("List notes", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  let note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title second note", "content":"Content second note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title third note", "content":"Content third note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title fourth note", "content":"Content fourth note"}})
// Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: ")
  console.log(note_result)
  const result = await bob.call("myInstanceName", "notes", "list_notes", {})
  console.log("list_notes: notes")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.length, 4)
})

orchestrator.run()
