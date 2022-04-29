const log = console.log
const $ = require('jquery')
const _s = require('underscore.string')
const {render, html} = require('uhtml')

module.exports = () => {
// #### Coinos CD module #### 

// Main URL routing: 
if(window.location.pathname.search('deploy') === -1) return 
if(window.location.pathname.search('log') === -1) return 

$(document.head).append(/*html*/`
  <style type="text/tailwindcss">
    #DEPLOY h2 { @apply text-2xl; }
    #DEPLOY p span { @apply text-gray-500 mr-1; }
  </style>
`)

let deployId = _s.strRight(window.location.pathname, 'deploy/')
log(deployId)
deployId = _s.strLeftBack(deployId, '/log')
log(deployId)

$.post(`/deploy/${deployId}`, deploy => {
  const deployUrl = `/deploy/${deploy._id}`
  render(document.body, html`
  <div class="bg-black text-white p-4">
    <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
    <a href="/" class="px-1 font-bold">Deploy</a>
  </div>
  <a href="${deployUrl}" class="hover:text-blue-500 m-4 block">
    <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
    <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>  
  </a>
  <p class="ml-4">Initial deployment log</p>
  <div id="LOG" class="mt-12 TERMINAL m-4"></div>
  `)

  $.post(`/deploy/${deployId}/log`, res => {
    if(!res) return alert('problem')
    $('#LOG').html(res.log)
  }).catch(res => {
    log(res)
  })

})



// #### /module #### 
}