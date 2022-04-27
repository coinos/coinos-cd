const log = console.log
const $ = require('jquery')
const _s = require('underscore.string')
const {render, html} = require('uhtml')

let deploy

module.exports = () => {
// #### Coinos CD module #### 

// Main URL routing: 
if(window.location.pathname.search('deploy') === -1) return 

$(document.head).append(/*html*/`
  <style type="text/tailwindcss">
    #DEPLOY h2 { @apply text-2xl; }
    #DEPLOY p span { @apply text-gray-500 mr-1; }
  </style>
`)

const deployId = _s.strRightBack(window.location.pathname, '/')
$.post('/deploy/' + deployId, res => {
  deploy = res
  let deployURL = `https://${deploy.HOST_NAME}`
  render(document.getElementById('DEPLOY'), html`
    <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>
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
        <a class="mt-4 bg-gray-200 p-3 border inline-block hover:bg-gray-400"
        href="#destroy">
          destroy
        </a>
      </div>
    </div>
  `)
})

// In-page routing: 
window.addEventListener('hashchange', e => {
  if(window.location.hash === '#destroy') { 
    log('destroy a deploy!')
    $.post(`/deploy/${deploy._id}/destroy`, (res, status) => {
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
    })
  }
})

// #### /module #### 
}