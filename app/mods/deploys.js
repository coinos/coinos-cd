const $ = require('jquery')
const {render, html} = require('uhtml')

module.exports = () => {
// #### Coinos CD module ####

// Main URL routing: 
if(window.location.pathname !== '/') return 

// Initial index template: 
$(document.body).prepend(/*html*/`
  <div class="bg-black text-white p-4">
  <a href="href="https://github.com/coinos"" class="px-1 mr-3">Code</a>
  <a href="index.html" class="px-1 font-bold">Deploy</a>
  </div>
  <div class="m-4">
  <h1 class="text-4xl font-bold">coinos deploys</h1>

  <div id="DEPLOYS"></div>

  <a href="/create" class="inline-block mt-12 bg-blue-600 text-white p-3 border border-gray-300
  hover:bg-yellow-300 hover:text-black hover:border-yellow-100"">+ Create new 
    <span class="font-bold">deploy</span>
  </a>
  </div>
`)

// Fetch & render deploy data: 
$.get('/deploys', deploys => {
  render(document.getElementById('DEPLOYS'), html`
    ${deploys.map( deploy => {
      let deployURL = `https://${deploy.HOST_NAME}`
      let deployURLinternal = `/deploy/${deploy._id}`
      return html`
      <div class="mt-10 border p-3">
        <div class="flex">
          <div class="text-2xl">
            <b class="">${deploy.SUBDOMAIN}</b> - regtest cloud
          </div> 
          <div class="flex-auto"></div>
          <div>
            <b class="text-green-400">✓</b> ONLINE
          </div>
        </div>
        <a class="mt-4 bg-green-100 p-3 border inline-block hover:bg-green-200"
        href="${deployURLinternal}">
          Droplet ${deploy.DROPLET_ID}
        </a>
        <a class="mt-4 p-3 inline-block text-blue-400"
        href="${deployURL}" target="_blank">
          ${deployURL}
        </a>
      </div>`})
    }`
  )
})

// #### /module #### 
}