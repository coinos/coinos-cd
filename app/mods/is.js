const {html} = require('uhtml')
const _ = require('underscore')

const is = (condition, template, elseTemplate) => {
  if(condition) return template()
  if(elseTemplate) return elseTemplate()
}

module.exports = is