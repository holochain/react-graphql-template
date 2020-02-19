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

orchestrator.registerScenario("Create a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})

  // Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: result")
  console.log(note_result)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"id": note_result.Ok.id, "created_at": note_result.Ok.createdAt})
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
  const updated_note_result = await alice.call("myInstanceName", "notes", "update_note", {"id": note.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
// Wait for all network activity to settle
  await s.consistency()

  console.log("update_note: ")
  console.log(updated_note_result)
  const result = await alice.call("myInstanceName", "notes", "get_note", {"id": note_result.Ok.id})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.title, 'Updated title first note')
  t.deepEqual(result.Ok.content, 'Updated content first note')

  const updated2_note_result = await alice.call("myInstanceName", "notes", "update_note", {"id": note.id, "note_input" : {"title":"Updated again title first note", "content":"Updated again content first note"}})
// Wait for all network activity to settle
  await s.consistency()

  console.log("update_note: ")
  console.log(updated2_note_result)
  const result2 = await alice.call("myInstanceName", "notes", "get_note", {"id": note_result.Ok.id})
  console.log("get_note: note")
  console.log(result2)
  // check for equality of the actual and expected results
  t.deepEqual(result2.Ok.title, 'Updated again title first note')
  t.deepEqual(result2.Ok.content, 'Updated again content first note')
})

orchestrator.registerScenario.only("Bob cant update Alice note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  let note = note_result.Ok
  console.log("create_note: ")
  console.log(note_result)
  const updated_note_result = await bob.call("myInstanceName", "notes", "update_note", {"id": note.id, "note_input" : {"title":"Updated title first note", "content":"Updated content first note"}})
// Wait for all network activity to settle
  await s.consistency()
  t.deepEqual(updated_note_result.Ok.title, 'Title first note')
  t.deepEqual(updated_note_result.Ok.content, 'Content first note')
})

orchestrator.registerScenario("Remove a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const note_result = await alice.call("myInstanceName", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
// Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: for delete")
  console.log(note_result)
  const result = await bob.call("myInstanceName", "notes", "list_notes", {})
  console.log("list_notes: notes")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.length, 1)
  const deleted_address = await alice.call("myInstanceName", "notes", "remove_note", { "id": note_result.Ok.id })
  console.log("delete_note: address")
  console.log(deleted_address)
  const result1 = await bob.call("myInstanceName", "notes", "list_notes", {})
  console.log("list_notes: notes")
  console.log(result1)
  t.deepEqual(result1.Ok.length, 0)
})

orchestrator.registerScenario("List notes", async (s, t) => {

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
