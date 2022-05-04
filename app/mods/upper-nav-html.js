const { html } = require('lighterhtml')

module.exports = () => {
  log(window.location.pathname)
  
  let pageType = 'deploy'
  if(window.location.pathname.search('test') > -1) pageType = 'test'

  return html`
  <div class="bg-black text-white p-4 flex">
    <a href="https://github.com/coinos" class="px-1 mr-4">Code</a>
    <a href="/deploys"
      class="px-1 mr-4 ${pageType == 'deploy' ? 'font-bold' : ''}">
      Deploy
    </a>
    <a href="/tests" 
      class="px-1 ${pageType == 'test' ? 'font-bold' : ''}">
      Test
    </a>
    <span class="flex-auto"></span>
    <a href="/logout" class="opacity-50 hover:opacity-100">logout</a>
  </div>
`
}