const {html} = require('uhtml')
const is = require('./is')

module.exports = deploy => {
  let deployURL = `https://${deploy.HOST_NAME}`
  let deployURLinternal = `/deploy/${deploy._id}`
  log(deploy)
  return html`
  <div class="mt-10 border p-3 max-w-3xl">
    <div class="flex">
      <div class="text-2xl">
        <b class="">${deploy.SUBDOMAIN}</b> - regtest cloud
      </div> 
      <div class="flex-auto"></div>
      <div>
        ${is(deploy.deploying, () => html`
        🚧 <b class="text-orange-500">DEPLOYING</b>`
        , //else:  
        () => html`
        <b class="text-green-400">✓</b> ONLINE`)}
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
  </div>`
}
