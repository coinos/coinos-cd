const no = require('node-html')

// ## Bundle ##
// Watch or compile the clientJS if 'w' or 'c' argument: 
const argv = process.argv[2]

if(argv === 'w') {
  console.log('watching...')
  no.watch() 
  //no.watch('client-login.js')
} else if(argv === 'c') {
  console.log('compiling...')
  no.compile(null, null, 'client.js')
  no.compile(null, null, 'client-login.js')

}

