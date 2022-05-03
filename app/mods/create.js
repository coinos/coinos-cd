const $ = require('jquery')
const {render, html} = require('lighterhtml')
const day= require('dayjs')
const spinner = require('./spinner')

let err = deployed = deploying = canceled = false
let terminalOutput = '> deploying new coinos instance...'

let deploy = {
  SUBDOMAIN : 'stager' + day().format('MDYYHHmm')
}

module.exports = () => {
// #### Coinos CD module #### 

if(window.location.pathname !== '/create') return

$(document.head).append(/*html*/`
  <style type="text/tailwindcss">
    #terminal { @apply mt-5 bg-black p-3 text-gray-100 whitespace-pre-line font-mono text-sm; }
  </style>
  ${spinner.style}`
)

$(document.body).prepend(/*html*/`
  <div class="bg-black text-white p-4">
    <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
    <a href="/" class="px-1 font-bold mr-3">Deploy</a>
    <a href="/tests" class="px-1">Test</a>
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
  <div class="flex items-center mt-12">
    <a href="#cancel" class="inline-block bg-red-200 p-3 border border-gray-300 mr-6 opacity-50
    hover:border-gray-400 hover:opacity-100">cancel 
    </a>
    <a class="mr-2 inline-block p-3 border font-bold opacity-90 bg-yellow-300 text-black cursor-default border-yellow-300"
      >deploying.... 
    </a>
    ${spinner.html('scale-50')}
  </div>
  <div id="terminal">
    > deploying new coinos instance...
    ${terminalOutput}
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
  <a href="#dismiss" class="ml-6 inline-block mt-12 p-3 border bg-blue-300 text-white border-blue-400 hover:border-blue-700 hover:bg-blue-400"
    >dismiss > 
  </a>
  <div id="terminal">
    > deploying new coinos instance...<br>
    ${terminalOutput}<br>
    > ok!
  </div>
  ${deployBoxHtml(deploy)}
 `
}

const errHtml = () => {
  if(!err) return ''
  return html`  
  <a href="/" class="inline-block mt-12 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-80
  hover:border-gray-400
  hover:opacity-100">< return 
  </a>
  <a class="inline-block mt-12 p-3 border font-bold bg-red-300 text-black cursor-default border-red-500"
    >error!
  </a>  
  <div id="terminal" class="mt-5 bg-black h-32 p-3 text-gray-100 whitespace-pre-line">
    ${err}
  </div>`
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
  ${errHtml()}

  <div class="my-10"></div>
  `)
}

const delay = async (seconds) =>
  await new Promise((r) => setTimeout(r, seconds ? seconds * 1000 : 1000))

const handleRes = async res => {
  if(canceled) return
  if(!res) return err ='no res'
  if(!res.deploying && !res.deployed) return log('not deploying.')
  if(res.deploying && !deploying ) { 
    //^ update deploying state on page reloads: 
    log('now deploying...')
    deploying = true 
  }
  log(res)
  terminalOutput = res.terminalOutput 
  deploy = res.deploy 
  renderContent()
  // const termDiv = document.getElementById("terminal")
  // termDiv.scrollTop = termDiv.scrollHeight
  if(!res.deployed) {
    await delay(6) //< wait 10 seconds then get another update:
    return $.post('/create/update', handleRes)
  }
  deploying = false 
  deployed = true
  renderContent()
  checkDeployStatus()
}

const checkDeployStatus = () => {
  log('checkDeployStatus')

  $.post(`/deploy/${deploy._id}/is-online` , res => {
    log(res)
    deploy.isOnline = true 
    renderContent()
  }).catch(async err => {
    deploy.isOnline = false 
    renderContent()
    await delay(10) //< check status every 10 seconds
    checkDeployStatus() 
  })
}

// In-page routing: 
window.addEventListener('hashchange', async e => {
  if(window.location.hash === '#deploy') {
    deploying = true 
    canceled = false
    renderContent()
    $.post('/create', deploy, handleRes)
  } else if(window.location.hash === '#cancel' || 
    window.location.hash === '#dismiss') {
    deploying = false 
    canceled = true
    renderContent()
    $.post(`/deploy/${deploy._id}/dismiss`)
    await delay(1) 
    window.location.pathname = `/`
  }
})

renderContent()


// check on status, if any.. 
$.post('/create/update', handleRes)

// #### /module #### 
}