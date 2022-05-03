global.log = console.log
const { html, render } = require('lighterhtml')
const is = require('./mods/is')
const delay = require('./mods/delay')
const $j = require('jquery')

let loggingIn = false 
let ok = null

$j(document.head).append(/*html*/`<style>
  input { background-color: #1e1e1e }
</style>`).addClass()

document.body.classList = ['bg-black text-white font-Roboto']

const inputClasses = `p-2 rounded mb-2 border border-white border-opacity-20 text-neutral-300
focus:border-opacity-40 outline-none placeholder-yellow-100 placeholder-opacity-50`

const renderPage = () => render( document.body, () => html`
  <div class="p-1 bg-black bg-opacity-20"></div>
  
  <div class="mt-2 -mb-12 mx-4 ${ok === null ? 'hidden' : ''}">
    ${is(!ok, () => html`
      <p class="p-2 border border-pink-900 bg-pink-400 text-pink-900">
        login failed
      </p>`
    , () => html`
      <p class="p-2 bg-green-400 bg-opacity-80 border-green-900 p2 text-green-800">
        login success!
      </p>
    `)}
  </div>

  <div class="mt-14 mx-4">
    <div class="${ok !== null || loggingIn ? 'opacity-50' : ''}">
      <input id="username" class="${inputClasses}" placeholder="username" 
      required disabled=${ok !== null || loggingIn ? 'true' : ''}></input>
      <br>
      <input id="password" type="password" class="${inputClasses}" 
      placeholder="password" required 
      disabled=${ok !== null || loggingIn ? 'true' : ''}></input>
    </div>
    ${is(ok !== null || loggingIn, //loggin in or failed state: 
      () => html`
      <a class="mt-3 inline-block bg-black text-white p-4 py-2
      rounded bg-white bg-opacity-20 select-none opacity-30">
        login
      </a>`, //default state: 
      () => html`
      <a class="mt-3 inline-block bg-black text-white p-4 py-2
      hover:bg-neutral-600 rounded bg-white bg-opacity-20"
      href="#login">
        login
      </a>`
    )}

  </div>
`)

window.addEventListener('hashchange', e => {
  if(window.location.hash !== '#login') return 
  $j.post('/coinos-cd-login', {
    username : $j('#username').val(),
    password: $j('#password').val() 
  }, async () => {
    ok = true 
    renderPage() 
    await delay(2)
    window.location.pathname = '/deploys'
  }).catch( () => {
    ok = false 
    renderPage() 
  })
})

window.location.hash = ''
renderPage() 