const log = console.log
const $ = require('jquery')
const {render, html} = require('uhtml')
const _s = require('underscore.string')

let deploy

// Main URL routing: 
if(window.location.pathname === '/') {
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
} else if(window.location.pathname.search('deploy') > -1) {

  $(document.head).append(/*html*/`
    <style type="text/tailwindcss">
      #DEPLOY h2 { @apply text-2xl; }
      #DEPLOY p span { @apply text-gray-500 mr-1; }
    </style>
  `)

  const deployId = _s.strRightBack(window.location.pathname, '/')
  $.post('/deploy/' + deployId, res => {
    deploy = res
    let deployURL = `https://${deploy.HOST_NAME}`
    render(document.getElementById('DEPLOY'), html`
      <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
      <h1 class="inline-block text-4xl font-light">${deploy.SUBDOMAIN} - regtest cloud</h1>
      <div class="grid grid-cols-3 mt-10">
        <div>
          <h2>details</h2>
          <p>
            <a class="text-blue-400"
            href="${deployURL}" target="_blank">
            ${deployURL}
            </a>
          </p>
          <p><span>Branch:</span> ${deploy.BRANCH_NAME}</p>
          <p><span>Host:</span> ${deploy.host}</p>
        </div>
        <div>
          <h2>tests</h2>
        </div>
        <div>
          <h2>deployment</h2>
          <a class="mt-4 bg-gray-200 p-3 border inline-block hover:bg-gray-400"
          href="#destroy">
            destroy
          </a>
        </div>
      </div>
    `)
  })
}


//reset hash URL on load: 
document.location.hash = ''

// In-page interactive routing: 
window.onhashchange = e => {
  if(window.location.hash === '#destroy') {
    log('destroy a deploy!')
    $.post(`/deploy/${deploy._id}/destroy`, (res, status) => {
      if(res !== 'OK') return alert('problem')
      render(document.getElementById('DEPLOY'), html`
        <h1 class="inline-block text-4xl font-bold mr-3">coinos server</h1>
        <h1 class="inline-block text-4xl font-light opacity-20 line-through">${deploy.SUBDOMAIN} - regtest cloud</h1>
        <p class="mt-4 p-3 bg-yellow-200">This deployment was destroyed successfully.</p>
        <a href="/" class="inline-block mt-2 bg-gray-100 text-gray-700 p-3 border border-gray-300 mr-6 opacity-80
        hover:border-gray-400
        hover:opacity-100">< return 
        </a>
      `)
    })
  }
  if(window.location.hash === '#deploy') {
    console.log('deploy!')
    $('a[href="#deploy"]').text('deploying...')
      .addClass('opacity-50 bg-yellow-300 text-black cursor-default border-yellow-300')
      .removeClass('bg-blue-600 border-yellow-100')
    
    $('#terminal').removeClass('opacity-0')

    $('#goBackBtn').text('cancel')
    .removeClass('bg-gray-100')
    .addClass('bg-red-200 text-white')
    .attr('href', '#cancel')
  } else if(window.location.hash === '#cancel') {
    window.location.reload()
  }
}
      