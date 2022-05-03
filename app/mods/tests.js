const {render, html} = require('lighterhtml')
const $ = require('jquery')
const is = require('./is')
const asyncjs = require('async')
const _ = require('underscore')
const _s = require('underscore.string')
const spinner = require('./spinner')

module.exports = () => {
// #### Coinos CD module #### 

if(window.location.pathname !== '/tests') return 

let tests = []
let subdomains = []
let selectedSubdomain = 'all'

$(document.head).append(spinner.style)

const hideOrShowClass = test => {
  if(!test.deploy) return ''
  if(selectedSubdomain === 'coinos.io' && test.deploy.HOST_NAME === 'coinos.io') {
    return ''
  }
  if(test.deploy.SUBDOMAIN === selectedSubdomain ||
    selectedSubdomain === 'all') {
    return ''
  }
  return 'hidden'
}

renderBody = () => render(document.body, () => html`
  <div class="bg-black text-white p-4">
    <a href="https://github.com/coinos" class="px-1 mr-3">Code</a>
    <a href="/" class="px-1 mr-3">Deploy</a>
    <a class="px-1 font-bold">Test</a>
  </div>
  <div class="m-4">
  <h1 class="text-4xl font-bold mb-6">coinos tests</h1>
  
  <div id="TESTS">
    ${is(tests.length, 
    () => html`
      <div>
        <a href="#test-tab/all" 
        class="font-black cursor-default border px-4 py-2
        ${selectedSubdomain === 'all' ? 'bg-gray-200' : ''}">
          all
        </a>
        ${subdomains.map( subdomain => html`
          <a href="#test-tab/${subdomain}" 
          class="border px-4 py-2 hover:bg-gray-100 cursor-default
          ${selectedSubdomain === subdomain ? 'bg-gray-200' : ''}">
            ${subdomain}
          </a>
        `)}
      </div>
      <hr class="bg-black mb-4" style="margin-top:6px; height:3px;" />
    `, 'there are no tests :/')}

    ${tests.map( test => html`
      <div class="mb-4 border-b-2 p-3 max-w-3xl flex items-center
      ${hideOrShowClass(test)}">
        ${is(test.testing, () => html`
          <div class="${hideOrShowClass(test)}">
            <a class="hover:text-blue-500" href="/test/${test.deploy_id}">
              <b>TODAY</b>
              <span class="opacity-50 mr-3"> (just now)</span>
              <a href="/test/${test.deploy_id}" class="font-black text-purple-500">IN PROGRESS</a>
              <br>
              ${is(test.deploy, 
              () => html`<a class="opacity-50 hover:text-blue-500" 
              href="/deploy/${test.deploy._id}">
                ${test.deploy.HOST_NAME === 'coinos.io' ? 'coinos.io' : test.deploy.SUBDOMAIN}
              </a>`
            )}
            </a>
          </div>
          <span class="flex-auto"></span>
          <div class="w-12 mr-10">
            ${spinner.html('scale-50')}
          </div>
          <img class="w-12" src="img/LogosPuppeteer.svg" />
        `, () => html`
          <div>
            <a class="hover:text-blue-500" href="/test/result/${test._id}">
              <b>${test.dateHuman}</b>
              <span class="opacity-50 ml-1"> (${test.dateAgo})</span>
              <b class="ml-1 ${test.passed ? 'text-green-500' : 'text-pink-500'}">
                ${test.passed ? 'OK' : 'NOTOK'}
              </b>
              <br>
            </a>
            ${is(test.deploy, 
              () => html`<a class="opacity-50 hover:text-blue-500" 
              href="/deploy/${test.deploy._id}">
                ${test.deploy.HOST_NAME === 'coinos.io' ? 'coinos.io' : test.deploy.SUBDOMAIN}
              </a>`
            )}
          </div>
          <span class="flex-auto"></span>
          ${is(test.passed, () => html`
            <img class="w-12 mx-6 opacity-30 scale-70" src="img/IonIosCheckmarkCircle.svg" />
          `, 
            () => html`
            <img class="w-12 mx-6 opacity-20 scale-70" src="img/IcBaselineError.svg" />
          `)}
          <img class="w-12" src="img/LogosPuppeteer.svg" />
          `
        )}
      </div>
    `)}
  </div>
`)

renderBody() 

const getDeploy = (test, callback) => {
  $.post(`/deploy/${test.deploy_id}`, deploy => 
    callback(null, deploy)
  ).catch( err => callback(err))
}

$.post('/tests', theTests => {
  tests = theTests
  renderBody()

  asyncjs.concat(tests, getDeploy)
  .then( deploys => {
    subdomains = _.chain(deploys)
    .map(deploy => {
      if(deploy.HOST_NAME === 'coinos.io') return 'coinos.io'
      return deploy.SUBDOMAIN
    }).unique().value()
    //assign each deploy to corresponding test: 
    tests.forEach( test => {
      test.deploy = _.findWhere(deploys, { _id : test.deploy_id})
    })
    renderBody()
  })
  .catch(err => {
    alert('there was an error getting a deploy for a test')
    log(err)
    renderBody()
  })
})

window.addEventListener('hashchange', async e => {
  if(window.location.hash.search('test-tab') === -1 ) return  
  log('switch test tabs')
  selectedSubdomain = _s.strRight(window.location.hash, 'test-tab/')
  log(selectedSubdomain)
  renderBody()
})


}