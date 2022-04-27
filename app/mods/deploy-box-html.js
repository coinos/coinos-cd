const {html} = require('uhtml')

module.exports = deploy => {
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
  </div>`
}
