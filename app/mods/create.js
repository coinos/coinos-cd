const $ = require('jquery')

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

    <div class="mt-12">
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
      <input class="ml-3 p-2 border border-gray-300 w-28" value="stager15" />
    </div>

    <div class="mt-4">
      <span class="text-gray-500">Branch</span>
      
      <select class="ml-3 p-2 bg-gray-100">
        <option>stageUpdate2</option>
        <option>master</option>
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


    <a id="goBackBtn" href="/" class="inline-block mt-12 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-50
    hover:border-gray-400
    hover:opacity-100">< go back 
    </a>

    <a class="inline-block mt-12 bg-blue-600 text-white p-3 border border-gray-300 font-bold
    hover:text-black
    hover:bg-yellow-300 hover:border-yellow-100"
      href="#deploy"> > Deploy 
    </a>

    <div id="terminal"
    class="opacity-0 mt-5 bg-black text-white h-32">
    </div>

  </div>
`)

// In-page routing: 
window.addEventListener('hashchange', e => {
  if(window.location.hash === '#deploy') {
    console.log('deploy!')
    $('a[href="#deploy"]').text('deploying...')
      .addClass('opacity-50 bg-yellow-300 text-black cursor-default border-yellow-300')
      .removeClass('bg-blue-600 border-yellow-100')
    
    $('#terminal').removeClass('opacity-0')

    $('#goBackBtn').text('cancel')
    .removeClass('bg-gray-100')
    .addClass('bg-red-200 text-white')
    .attr('href', '#cancel')
  } else if(window.location.hash === '#cancel') {
    window.location.reload()
  }
})

// #### /module #### 
}