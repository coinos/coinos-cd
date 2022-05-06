const no = require('node-html')
const fs = require('fs')
const jsObfu = require('javascript-obfuscator')

// ## Bundle ##
// Watch or compile the clientJS if 'w' or 'c' arg supplied
// or 'p' for prod build 

const argv = process.argv[2]

const prodBundle = async () => {
  await no.compile(false, true, 'client.js')
  const bundleCode = () => fs.readFileSync('./client.bundle.js', 'utf-8')
  const bundleCodeObfuscated = jsObfu.obfuscate(bundleCode())
  fs.writeFileSync('./client.bundle.js', bundleCodeObfuscated.getObfuscatedCode())
  no.compress( bundleCode(), './client.bundle.js', 
    { drop_console : true })
  console.log('compiled, obfuscated and compressed client bundle OK.')

  await no.compile(false, true, 'client-login.js')
  const loginBundleCode = () => fs.readFileSync('./client-login.bundle.js', 'utf-8')
  const loginBundleCodeObfuscated = jsObfu.obfuscate(loginBundleCode())
  fs.writeFileSync('./client-login.bundle.js', loginBundleCodeObfuscated.getObfuscatedCode())
  no.compress( bundleCode(), './client.bundle.js', 
    { drop_console : true })
  console.log('compiled, obfuscated and compressed login bundle OK.')
}

if(argv === 'p') {
  prodBundle()

} else if(argv === 'w') {
  console.log('watching...')
  no.watch() 
  //no.watch('client-login.js')
} else if(argv === 'c') {
  console.log('compiling...')
  no.compile(null, null, 'client.js')
  no.compile(null, null, 'client-login.js')
}