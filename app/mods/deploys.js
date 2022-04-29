const $ = require('jquery')
const {render, html} = require('uhtml')

module.exports = () => {
// #### Coinos CD module ####

// Main URL routing: 
if(window.location.pathname !== '/') return 

// Initial index template: 
$(document.body).prepend(/*html*/`
  <div class="bg-black text-white p-4">
  <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
  <a class="px-1 font-bold">Deploy</a>
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

const deployBoxHtml = require('./deploy-box-html')

// Fetch & render deploy data: 
$.get('/deploys', deploys => {
  $.post('/test/update', testStatus => {
    render(document.getElementById('DEPLOYS'), html`
      ${deploys.map( deploy => {
        deploy.isTesting = testStatus.testingId === deploy._id
        return deployBoxHtml(deploy) }
      )}`
    )
  })
})

// #### /module #### 
}