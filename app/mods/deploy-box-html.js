const {html} = require('uhtml')
const is = require('./is')

module.exports = deploy => {
  let deployURL = `https://${deploy.HOST_NAME}`
  let deployURLinternal = `/deploy/${deploy._id}`
  let testURL = `/test/${deploy._id}`
  log(deploy)
  return html`
  <div class="mt-10 border p-3 max-w-3xl">
    <div class="flex">
      <div class="text-2xl">
        <b class="">${deploy.SUBDOMAIN}</b> - regtest cloud
      </div> 
      <div class="flex-auto"></div>
      <div class="text-right">
        ${is(deploy.deploying, 
          () => html`🚧 <a class="font-bold text-orange-500"
          href="/create">DEPLOYING</a>`, //else: 
          () => html`<b class="text-green-400">✓</b> ONLINE`)}
        ${is(deploy.isTesting, 
          () => html`<a class="block" href="${testURL}">
            🔬 <span class="font-bold text-orange-400 hover:text-orange-600"
          href="${deploy.testURL}">TESTING</span>
        </a>`)
        }
      </div>
    </div>
    <a class="mt-4 bg-green-100 p-3 border inline-block hover:bg-green-200"
    href="${deployURLinternal}">
      Droplet ${deploy.DROPLET_ID}
    </a>
    <a class="mt-4 p-3 inline-block text-blue-400"
    href="${deployURL}" target="_blank">
      ${deployURL} 🌎
    </a>
  </div>`
}
