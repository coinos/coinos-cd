const log = console.log
const $ = require('jquery')
const _s = require('underscore.string')
const {render, html} = require('uhtml')
const is = require('./is')
const _ = require('underscore')

let deploy, deployWebURL, deployLogURL, testURL, isTesting, error
let testHistory = []

module.exports = () => {
// #### Coinos CD module #### 

// Main URL routing: 
if(window.location.pathname.search('deploy') === -1) return 
if(window.location.pathname.search('log') > -1) return 

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

const historyHtml = () => html`
  ${testHistory.map(test => {
    const testResultUrl = `/test/result/${test._id}`
    return html`
      <a class="block text-blue-400 hover:text-blue-600" 
      href="${testResultUrl}">> ${test.ago}</a>`
    }
  )}
`
const renderContent = () => 
  render(document.getElementById('DEPLOY'), html`
    <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>
    ${errHtml()}
    <a class="${deployWebURLclasses}"
      href="${deployWebURL}" target="_blank">
      ${deployWebURL} ${is(isOnline, `🌎` )}
      ${is(isOnline === false, `✖`)}
    </a>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <h2>details</h2>
        <p><span>Deployed:</span> ${deploy.date.ago}</p>
        <p><span>Branch:</span> ${deploy.BRANCH_NAME}</p>
        <p><span>Host:</span> ${deploy.host}</p>
        <p><span>Droplet ID:</span> ${deploy.DROPLET_ID}</p>
        <p><span>IP:</span> ${deploy.IP_ADDRESS}</p>
      </div>
      <div>
        <h2>tests</h2>
        ${is(history.length, historyHtml, 
          () => html`<p><span>(no tests yet)</span></p>`
        )}

        ${is(isTesting && isOnline, () => html`
          <a href="${testURL}" class="mt-3 mr-2 inline-block p-3 border font-bold opacity-90 bg-purple-300 text-black border-purple-500 hover:border-purple-800"
            >testing.... 
          </a>`
        )}
        ${is(isOnline && !isTesting, () => html`
          <a class="inline-block mt-3 bg-blue-600 text-white p-3 border border-gray-300 font-bold
            hover:text-black hover:bg-purple-300 hover:border-purple-100"
            href="${testURL}"> > Test 
          </a>`
        )}
        ${is(isOnline === false, () => html`
          <a disabled class="inline-block mt-3 bg-gray-100 p-3 border border-gray-300 opacity-40 text-gray-400 select-none"
          > > Test 
          </a>`
        )}
        ${is(deploy.deploying, `test can run after deploy`)}

      </div>
      <div>
        <h2>deployment</h2>
        <div class="mt-4">
          ${is(deploy.deploying, 
          () => html`🚧 <a class="font-bold text-orange-500"
          href="/create">DEPLOYING</a>`)}
          ${is(_.isUndefined(isOnline) && !deploy.deploying,
            () => html`<span class="opacity-50">checking status</span>`
          )}
          ${is(isOnline, 
            () => html`<b class="text-green-400">✓</b> ONLINE`)}
          ${is(isOnline === false, 
            () => html`<b class="text-red-400">✖</b> OFFLINE`)}
        </div>
        ${is(!deploy.deploying, 
          () => html`<a href="${deployLogURL}" class="block text-blue-400 hover:text-blue-600 mt-2">
          > initial deploy log</a>`
        )}
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
  deployWebURL = `https://${deploy.HOST_NAME}`
  deployLogURL = `/deploy/${deploy._id}/log`
  testURL = `/test/${deploy._id}`
  testHistoryURL = `/test/${deploy._id}/history`,
  renderContent()
  
  $.post('/test/update', res => {
    log(res)
    if(res.testingId === deploy._id) {
      isTesting = true
      log(isTesting)
    }
    renderContent() 

    $.post(testHistoryURL,  res => {
      log(res)
      testHistory = res 
      renderContent() 
    })
  })
})

let isOnline
let deployWebURLclasses = `block my-6 `
//online check 
$.post(`/deploy/${deployId}/is-online`, () => {
  isOnline = true 
  deployWebURLclasses = `${deployWebURLclasses} text-blue-400 hover:text-blue-500`
  renderContent()
}).catch( () => {
  isOnline = false 
  deployWebURLclasses = `${deployWebURLclasses} opacity-50`
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