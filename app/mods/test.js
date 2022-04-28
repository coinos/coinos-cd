const log = console.log
const _s = require('underscore.string')
const $ = require('jquery')
const {render, html} = require('uhtml')
const spinner = require('./spinner')

const delay = async (seconds) =>
  await new Promise((r) => setTimeout(r, seconds ? seconds * 1000 : 1000))

  
module.exports = () => {
// #### Coinos CD module #### 

if(window.location.pathname.search('test') === -1) return 

log('this is a coinos test')

let deployId = _s.strRight(window.location.pathname, 'test/')
log(deployId)

let testing = true
let deploy


$(document.head).append(spinner.style)

const renderContent = () => 
  render(document.body, html`
  <div class="bg-black text-white p-4">
    <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
    <a href="/" class="px-1 mr-3">Deploy</a>
    <a href="/" class="px-1 font-bold">Test</a>

  </div>
  <div class="m-4">
    <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>  
  </div>
  ${testingHtml()}
  ${testedHtml()}
  <div id="TEST" class="mt-12 TERMINAL m-4 !pb-8"></div>
  `)

const testingHtml = () => {
  if(!testing) return ''
  return html`
  <div class="flex items-center m-4">
    <a href="#dismiss-test" class="inline-block bg-red-200 p-3 border border-gray-300 mr-6 opacity-50
    hover:border-gray-400 hover:opacity-100">cancel 
    </a>
    <a class="mr-2 inline-block p-3 border font-bold opacity-90 bg-yellow-300 text-black cursor-default border-yellow-500"
      >testing.... 
    </a>
    ${spinner.html('scale-50')}
  </div>`
}

const testedHtml = () => {
  if(testing) return ''
  return html`
  <div class="flex items-center m-4">
    <a class="mr-2 inline-block p-3 border font-bold opacity-90 bg-green-300 text-black cursor-default border-green-500"
      >test complete! 
    </a>
    <a href="#dismiss-test" class="ml-2 inline-block p-3 border bg-blue-300 border-blue-400 hover:border-blue-700 hover:bg-blue-400">
      dismiss > 
    </a>
  </div>`
}


$(document.head).append(/*html*/`
  <style type="text/tailwindcss">
    #DEPLOY h2 { @apply text-2xl; }
    #DEPLOY p span { @apply text-gray-500 mr-1; }
  </style>
`)

$.post(`/deploy/${deployId}`, theDeploy => {
  deploy = theDeploy
  renderContent()
})

const handleRes = async res => {
  log(res)
  $('#TEST').html(res.testOutput)
  if(res.testing) {
    await delay(6) //< wait 10 seconds then get another update:
    return $.post('/test/update', handleRes)
  }
  testing = false 
  renderContent()
}

$.post(`/test/update`, handleRes) 


window.addEventListener('hashchange', async e => {
  if(window.location.hash === '#dismiss-test') { 
    $.post(`/test/${deploy._id}/dismiss`)
    await delay(1)
    window.location.pathname = `/deploy/${deploy._id}`
  }
})


// #### /module #### 
}