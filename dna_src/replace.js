var fs = require('fs')
var path = require('path')
var templateC = 'Note'
var template = 'note'
var zomeC = 'Player'
var zome = 'player'

function replace(fileName, template, zome) {
  var templateFile = fs.readFileSync(path.resolve(__dirname, fileName)).toString()
  newContent = templateFile.replace(new RegExp(template, 'g'), zome)
  fs.writeFileSync(path.resolve(__dirname, fileName), newContent)
}

replace('zomes/players/zome.json', template, zome)
replace('zomes/players/code/.hcbuild', template, zome)
replace('zomes/players/code/cargo.toml', template, zome)
replace('zomes/players/code/src/lib.rs', templateC, zomeC)
replace('zomes/players/code/src/lib.rs', template, zome)
fs.renameSync(path.resolve(__dirname, 'zomes/players/code/src/' + template), path.resolve(__dirname, 'zomes/players/code/src/' + zome))
replace('zomes/players/code/src/'  + zome + '/mod.rs', templateC, zomeC)
replace('zomes/players/code/src/'  + zome + '/mod.rs', template, zome)
replace('zomes/players/code/src/'  + zome + '/mod.rs', template.toUpperCase(), zome.toUpperCase())
replace('zomes/players/code/src/'  + zome + '/handlers.rs', templateC, zomeC)
replace('zomes/players/code/src/'  + zome + '/handlers.rs', template, zome)
replace('zomes/players/code/src/'  + zome + '/handlers.rs', template.toUpperCase(), zome.toUpperCase())
replace('zomes/players/code/src/'  + zome + '/validation.rs', templateC, zomeC)
replace('zomes/players/code/src/'  + zome + '/validation.rs', template, zome)
replace('zomes/players/code/src/'  + zome + '/validation.rs', template.toUpperCase(), zome.toUpperCase())
