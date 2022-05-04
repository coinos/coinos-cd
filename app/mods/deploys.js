const $ = require('jquery')
const {render, html} = require('lighterhtml')
const upperNavHtml = require('./upper-nav-html')

module.exports = () => {
// #### Coinos CD module ####

// Main URL routing: 
if(window.location.pathname !== '/deploys') return 

let deploys

// Initial index template: 
render(document.body, () => html`
  ${upperNavHtml()}
  <div class="m-4">
    <h1 class="text-4xl font-bold">coinos deploys</h1>

    <div id="DEPLOYS"></div>

    <a href="/create" class="${deploys ? 'mt-12' : 'mt-6'} inline-block bg-blue-600 text-white p-3 border border-gray-300
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
$.post('/deploys', res => {
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