global.log = console.log
const $ = require('jquery')

//reset hash URL on load: 
document.location.hash = ''

//mods: 
require('./mods/deploy')()
require('./mods/deploys')()


// In-page routing: 
window.addEventListener('hashchange', e => {
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
})