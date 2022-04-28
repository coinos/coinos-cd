const log = console.log
const $ = require('jquery')
const _s = require('underscore.string')
const {render, html} = require('uhtml')
const is = require('./is')

let deploy, deployURL, error

module.exports = () => {
// #### Coinos CD module #### 

// Main URL routing: 
if(window.location.pathname.search('deploy') === -1) return 

// Initial deploy template: 
$(document.head).append(/*html*/`
  <style type="text/tailwindcss">
    #DEPLOY h2 { @apply text-2xl; }
    #DEPLOY p span { @apply text-gray-500 mr-1; }
  </style>
`)

$(document.body).prepend(/*html*/`
  <div class="bg-black text-white p-4">
  <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
  <a href="/" class="px-1 font-bold">Deploy</a>
  </div>
  <div id="DEPLOY" class="m-4"></div>
`)

const errHtml = () => {
  if(!error) return 
  return html`<div class="mt-6 bg-red-200 p-3">There was an error.</div>`
}

const renderContent = () => 
  render(document.getElementById('DEPLOY'), html`
    <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>
    ${errHtml()}
    <div class="grid grid-cols-3 mt-10">
      <div>
        <h2>details</h2>
        <p>
          <a class="text-blue-400"
          href="${deployURL}" target="_blank">
          ${deployURL}
          </a>
        </p>
        <p><span>Branch:</span> ${deploy.BRANCH_NAME}</p>
        <p><span>Host:</span> ${deploy.host}</p>
        <p><span>IP:</span> ${deploy.IP_ADDRESS}</p>
        <p><span>Droplet ID:</span> ${deploy.DROPLET_ID}</p>
      </div>
      <div>
        <h2>tests</h2>
        <p><span>(no tests yet)</span></p>
      </div>
      <div>
        <h2>deployment</h2>
        <div class="mt-4">
          ${is(deploy.deploying, 
          () => html`🚧 <b class="text-orange-500">DEPLOYING</b>`, //else: 
          () => html`<b class="text-green-400">✓</b> ONLINE`)}
        </div>
        <a class="mt-4 bg-gray-200 p-3 border inline-block hover:bg-gray-400"
        href="#destroy">
          destroy
        </a>
      </div>
    </div>
  `)

//Fetch and render the details of this specific deploy: 
const deployId = _s.strRightBack(window.location.pathname, '/')
$.post('/deploy/' + deployId, res => {
  deploy = res
  log(deploy)
  deployURL = `https://${deploy.HOST_NAME}`
  renderContent()
})

// In-page routing: 
window.addEventListener('hashchange', e => {
  if(window.location.hash === '#destroy') { 
    const confirmed = confirm('destroy this instance?')
    if(!confirmed) return window.location.hash = ''
    log('destroy a deploy!')
    $.post(`/deploy/${deploy._id}/destroy`, res => {
      if(res !== 'OK') return alert('problem')
      render(document.getElementById('DEPLOY'), html`
        <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
        <h1 class="inline-block text-4xl font-light opacity-20 line-through">${deploy.SUBDOMAIN} - regtest cloud</h1>
        <p class="mt-4 p-3 bg-yellow-200">This deployment was destroyed successfully.</p>
        <a href="/" class="inline-block mt-2 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-80
        hover:border-gray-400
        hover:opacity-100">< return 
        </a>
      `)
    }).catch(res => {
      log(res)
      error = true
      renderContent()
    })
  }
})

// #### /module #### 
}