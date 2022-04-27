const $ = require('jquery')
const {render, html} = require('uhtml')
const day= require('dayjs')

let deployed = deploying = false

let deploy = {
  SUBDOMAIN : 'stager' + day().format('MDYYHHmm')
}

module.exports = () => {
// #### Coinos CD module #### 

if(window.location.pathname !== '/create') return

$(document.body).prepend(/*html*/`
  <div class="bg-black text-white p-4">
    <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
    <a href="/" class="px-1 font-bold">Deploy</a>
  </div>
  <div class="m-4">
    <div class="text-4xl font-bold">
        coinos deploys
        <span class="ml-2 font-light">create new</span>
    </div>
    <div id="CONTENT" class="mt-12"></div>
  </div>
`)

// templates for #CONTENT div: 
const notDeployingHtml = () => {
  if(deploying || deployed) return ''
  return html`
  <a id="goBackBtn" href="/" class="inline-block mt-12 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-50
  hover:border-gray-400
  hover:opacity-100">< go back 
  </a>

  <a class="inline-block mt-12 bg-blue-600 text-white p-3 border border-gray-300 font-bold
  hover:text-black
  hover:bg-yellow-300 hover:border-yellow-100"
    href="#deploy"> > Deploy 
  </a>`
}

const deployingHtml = () => {
  if(!deploying) return ''
  return html`
  <a href="#cancel" class="inline-block mt-12 bg-red-200 p-3 border border-gray-300 mr-6 opacity-50
  hover:border-gray-400 hover:opacity-100">cancel 
  </a>
  <a class="inline-block mt-12 p-3 border font-bold opacity-90 bg-yellow-300 text-black cursor-default border-yellow-300"
    >deploying.... 
  </a>
  <div id="terminal" class="mt-5 bg-black h-32 p-3 text-gray-100">
    > deploying new coinos instance...
  </div>`
}

const deployBoxHtml = require('./deploy-box-html')

const deployedHtml = () => {
  if(!deployed) return ''
  return html`
  <a href="/" class="inline-block mt-12 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-80
  hover:border-gray-400
  hover:opacity-100">< return 
  </a>
  <a class="inline-block mt-12 p-3 border font-bold bg-green-300 text-black cursor-default border-green-500"
    >deployed!
  </a>  
  <div id="terminal" class="mt-5 bg-black h-32 p-3 text-gray-100">
    > deploying new coinos instance...<br>
    > ok!
  </div>
  ${deployBoxHtml(deploy)}
 `
}

const renderContent = () => {
  render(document.getElementById('CONTENT'), html`
  <div class="${deploying || deployed ? 'opacity-40' : ''}">
    <div>
      <span class="text-gray-400">Type</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400" disabled value="cloud (Digital Ocean Droplet)" />
    </div>

    <div class="mt-4">
      <span class="text-gray-400">OS</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400 w-40" disabled value="Ubuntu 20.04" />
    </div>

    <div class="mt-4">
      <span class="text-gray-400">RAM</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400 w-14" disabled value="8GB" />
    </div>

    <div class="mt-4">
      <span class="text-gray-400">Domain</span>
      <input class="inline-block ml-3 p-2 border border-gray-300 text-gray-400 w-36" disabled value="coinos.cloud" />
    </div>

    <div class="mt-4">
      <span class="text-gray-500">Subdomain</span>
      <input class="ml-3 p-2 border border-gray-300 w-40" value="${deploy.SUBDOMAIN}"
      onchange=${e => deploy.SUBDOMAIN = e.currentTarget.value} />
    </div>

    <div class="mt-4">
      <span class="text-gray-500">Branch</span>
      <select class="ml-3 p-2 bg-gray-100">
        <option>stageUpdate2</option>
        <option disabled>master</option>
      </select>
    </div>

    <div class="mt-4">
      <span class="text-gray-400">BTC Network</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400 w-24" disabled value="regtest" />
    </div>


    <div class="mt-4">
      <span class="text-gray-400">SSH Port</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400 w-16" disabled value="729" />
    </div>

    <div class="mt-4">
      <span class="text-gray-400">Password</span>
      <input class="ml-3 p-2 border border-gray-300 text-gray-400 w-64" disabled value="XKArt1Nf31LmqL5a" />
    </div>
  </div>

  ${notDeployingHtml()}
  ${deployingHtml()}
  ${deployedHtml()}

  <div class="my-10"></div>
  `)
}

// In-page routing: 
window.addEventListener('hashchange', e => {
  if(window.location.hash === '#deploy') {
    deploying = true 
    renderContent()
    $.post('/create', deploy, res => {
      if(!res || !res._id) throw 'no res'
      log(res)
      deploy = res 
      deploying = false 
      deployed = true
      renderContent()
    })
  } else if(window.location.hash === '#cancel') {
    deploying = false 
    renderContent()
  }
})

renderContent()

// #### /module #### 
}