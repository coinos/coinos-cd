const {html} = require('uhtml')
const is = require('./is')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const _ = require('underscore')

module.exports = deploy => {
  let deployURL = `https://${deploy.HOST_NAME}`
  let deployURLinternal = `/deploy/${deploy._id}`
  let testURL = `/test/${deploy._id}`
  let testedAgo, testResultUrl
  if(deploy.lastTest) {
    testedAgo = dayjs(deploy.lastTest.date).fromNow()
    testResultUrl = `/test/result/${deploy.lastTest.test_id}`
  }

  let onlineHtml
  //^ for the top right corner 'status' indication

  let deployURLclasses = `mt-4 p-3 inline-block`
  //^ for the URL part of the template 
  let btnClasses = `mt-4 p-3 border inline-block`

  if(_.isUndefined(deploy.isOnline)) {
    btnClasses = btnClasses + ' opacity-40 bg-gray-200'
    deployURLclasses = deployURLclasses + ' text-blue-400 opacity-40'
    onlineHtml = () => html`<span class="opacity-40"> checking status...</span>`
  } else if(deploy.isOnline) {
    btnClasses = btnClasses + ' bg-green-100 hover:bg-green-200'
    deployURLclasses = deployURLclasses + ' text-blue-400'
    onlineHtml = () => html`<b class="text-green-400">✓</b> ONLINE`
  } else {
    btnClasses = btnClasses + ' opacity-40 bg-gray-100 hover:bg-gray-200'
    deployURLclasses = deployURLclasses + ' opacity-60'
    onlineHtml = () => html`<b class="text-red-400">✖</b> OFFLINE`
  }

  log(deploy)
  return html`
  <div class="mt-10 border p-3 max-w-3xl">
    <div class="flex">
      <a href="${deployURLinternal}" class="text-2xl hover:text-blue-700">
        <b class="">${deploy.SUBDOMAIN}</b> - regtest cloud
      </a> 
      <div class="flex-auto"></div>
      <div class="text-right">
        ${is(deploy.deploying, 
          () => html`🚧 <a class="font-bold text-orange-500"
          href="/create">DEPLOYING</a>`, //else: 
          onlineHtml
        )}
        ${is(deploy.isTesting, 
          () => html`<a class="block" href="${testURL}">
            🔬 <span class="font-bold text-purple-400 hover:text-purple-600"
          href="${deploy.testURL}">TESTING</span>
        </a>`)
        }
     
        ${is(deploy.lastTest, () => html`
          <a href="${testResultUrl}" class="block text-blue-400">tested 
          ${testedAgo}</a>
        `)}
      </div>
    </div>
    <a class="${btnClasses}"
    href="${deployURLinternal}">
      Droplet ${deploy.DROPLET_ID}
    </a>
    <a class="${deployURLclasses}"
    href="${deployURL}" target="_blank">
      ${deployURL} ${is(deploy.isOnline, `🌎`, `✖` )}
    </a>
  </div>`
}
