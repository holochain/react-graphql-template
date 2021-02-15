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
    // singleConductor,
  )
})

const dna = Config.dna(dnaPath, 'notes-test')
// const conductorConfig = Config.gen({notes: dna})
const conductorConfig = Config.gen({notes: dna}, {
  network: {
    type: 'sim2h',
    sim2h_url: 'ws://localhost:9000'
  }
})

orchestrator.registerScenario("Generate config and key for Alice & Bob", async (s, t) => {
  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig}, true)
  await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title first note", "content":"Content first note"}})
  await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title second note", "content":"Content second note"}})
  await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title third note", "content":"Content third note"}})
  await alice.call("notes", "notes", "create_note", {"note_input" : {"title":"Title fourth note", "content":"Content fourth note"}})
  await s.consistency()
})

orchestrator.run()
