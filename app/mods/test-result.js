const $ = require('jquery')
const _s = require('underscore.string')
const {render, html} = require('lighterhtml')
const is = require('./is')
const upperNavHtml = require('./upper-nav-html')

module.exports = () => {
  if(window.location.pathname.search('test') === -1) return false 
  if(window.location.pathname.search('result') === -1) return
  
  const testId = _s.strRight(window.location.pathname, 'result/')
  let test 
  let subdomain = ''
  let deployUrl 
  let deployType = 'regtest cloud'


  const dateHtml = () => {
    if(!test) return ''
    return html`<p class="ml-4">Test completed on ${test.dateHuman} (${test.ago})</p>`
  }

  const renderPage = () => 
    render(document.body, html`
      ${upperNavHtml()}
      <a href="${deployUrl}" class="hover:text-blue-500 ml-3 my-4 block">
        <h1 class="inline-block text-4xl font-bold">
        ${is(deploy.HOST_NAME !== 'coinos.io', 
          () => html`<span class="mr-3">coinos server</span>`
        )}        
        </h1>
        <h1 class="inline-block text-4xl font-light">${subdomain} - ${deployType}</h1>  
      </a>
      ${dateHtml()}
      <p class="font-bold ml-4 mt-2 ${test.passed ? 'text-green-500' : 'text-pink-500'}">
        ${test.passed ? 'PASSED  ✔' : 'FAILED ✖'}        
      </p>
      <div class="mt-8 TERMINAL m-4 !pb-8">
        ${test.result}
      </div>
  `)

  $.post('/test/result/' + testId, res => {
    log(res)
    test = res.test 
    deploy = res.deploy 
    subdomain = res.deploy.SUBDOMAIN
    deployUrl = `/deploy/${deploy._id}`

    // accommodate for coinos.io mothership deploy: 
    if(deploy.HOST_NAME === 'coinos.io') {
      deployType = 'LIVE PRODUCTION'
      subdomain = 'coinos.io'
    }

    renderPage()
  })
}