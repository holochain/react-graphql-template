/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example
const uuidv1 = require('uuid/v1')
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
  const address = await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title first note", "content":"Content first note"}})

  // Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: address")
  console.log(address)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"address": address.Ok})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.title, 'Title first note')
  t.deepEqual(result.Ok.content, 'Content first note')
})

orchestrator.registerScenario("Update a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const address = await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title first note", "content":"Content first note"}})
  await s.consistency()
  const get_note_result = await alice.call("myInstanceName", "notes", "get_note", {"address": address.Ok})
  let get_note = get_note_result.Ok
  get_note.title = "Updated title first note"
  get_note.content = "Updated content first note"
  const updated_address = await alice.call("myInstanceName", "notes", "update_note", {"note" : get_note, "address": address.Ok })
// Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: address")
  console.log(address)
  console.log("update_note: address")
  console.log(updated_address)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"address": updated_address.Ok})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.title, 'Updated title first note')
  t.deepEqual(result.Ok.content, 'Updated content first note')
})

orchestrator.registerScenario("Delete a note", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const address = await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title first note", "content":"Content first note"}})
  const deleted_address = await alice.call("myInstanceName", "notes", "remove_note", { "address": address.Ok })
// Wait for all network activity to settle
  await s.consistency()
  console.log("create_note: address")
  console.log(address)
  console.log("delete_note: address")
  console.log(deleted_address)
  const result = await bob.call("myInstanceName", "notes", "get_note", {"address": deleted_address.Ok})
  console.log("get_note: note")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result, { Err: { Internal: 'No entry at this address' } })
})

orchestrator.registerScenario("List notes", async (s, t) => {

  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)

  // Make a call to a Zome function
  // indicating the function, and passing it an input
  await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title first note", "content":"Content first note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title second note", "content":"Content second note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title third note", "content":"Content third note"}})
  await alice.call("myInstanceName", "notes", "create_note", {"note" : {"uuid": uuidv1(), "timestamp": Math.floor(Date.now() / 1000), "title":"Title fourth note", "content":"Content fourth note"}})
// Wait for all network activity to settle
  await s.consistency()
  const result = await bob.call("myInstanceName", "notes", "list_notes", {})
  console.log("list_notes: notes")
  console.log(result)
  // check for equality of the actual and expected results
  t.deepEqual(result.Ok.length, 4)
})

orchestrator.run()
