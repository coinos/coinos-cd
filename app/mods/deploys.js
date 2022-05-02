const $ = require('jquery')
const {render, html} = require('uhtml')

module.exports = () => {
// #### Coinos CD module ####

// Main URL routing: 
if(window.location.pathname !== '/') return 

let deploys

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

const renderDeploys = () => 
  render(
    document.getElementById('DEPLOYS'), 
    html`
      ${deploys.map( deploy => deployBoxHtml(deploy) )}
    `)

// Fetch & render deploy data: 
$.get('/deploys', res => {
  deploys = res
  //Get the most recent test... 
  $.post('/test/update', testStatus => {
    log(testStatus)
    renderDeploys() 
  })

  deploys.forEach( deploy => {
    let url = `/deploy/${deploy._id}/is-online`
    $.post(url, res => {
      log(res)
      deploy.isOnline = true 
      renderDeploys()
    }).catch( err => {
      log('deploy.isOnline = false')
      deploy.isOnline = false 
      renderDeploys()
    })
  })
})

// #### /module #### 
}