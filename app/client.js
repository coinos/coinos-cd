global.log = console.log

//reset hash URL on load: 
document.location.hash = ''

//mods: 
require('./mods/deploys')()
require('./mods/deploy')()
require('./mods/deploy-log')()
require('./mods/create')()
require('./mods/test')()