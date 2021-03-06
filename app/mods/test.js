const log = console.log
const _s = require('underscore.string')
const $ = require('jquery')
const {render, html} = require('lighterhtml')
const spinner = require('./spinner')
const is = require('./is')
const upperNavHtml = require('./upper-nav-html')

const delay = async (seconds) =>
  await new Promise((r) => setTimeout(r, seconds ? seconds * 1000 : 1000))


module.exports = () => {
// #### Coinos CD module #### 

if(window.location.pathname.search('test') === -1) return 
if(window.location.pathname.search('tests') > -1) return 
if(window.location.pathname.search('result') > -1) return 

log('this is a coinos test')

let deployId = _s.strRight(window.location.pathname, 'test/')
log(deployId)

let testing = true
let deploy
let deployType = 'regtest cloud'


$(document.head).append(spinner.style)

const renderContent = () => 
  render(document.body, html`
  ${upperNavHtml()}
  <a href="${deployUrl}" class="hover:text-blue-500 m-4 block">
    <h1 class="inline-block text-4xl font-bold">
      ${is(deploy.HOST_NAME !== 'coinos.io', 
        () => html`<span class="">coinos server</span>`
      )}    
    </h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - ${deployType}</h1>  
  </a>
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
    <a class="mr-2 inline-block p-3 border font-bold opacity-90 bg-purple-300 text-black cursor-default border-purple-500"
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

$.post(`/deploy/${deployId}`, theDeploy => {
  deploy = theDeploy
  deployUrl = `/deploy/${deploy._id}`

  // accommodate for coinos.io mothership deploy: 
  if(deploy.HOST_NAME === 'coinos.io') {
    deployType = 'LIVE PRODUCTION'
    deploy.SUBDOMAIN = 'coinos.io'
  }

  renderContent()
  $.post(`/test/update`, handleRes) 
})



window.addEventListener('hashchange', async e => {
  if(window.location.hash === '#dismiss-test') { 
    $.post(`/test/${deploy._id}/dismiss`)
    await delay(1)
    window.location.pathname = `/deploy/${deploy._id}`
  }
})


// #### /module #### 
}