const _ = require('underscore')

const is = (condition, template, elseTemplate) => {
  if(condition) {
    log(template)
    if(_.isString(template)) return () => template
    return template() 
  }
  if(elseTemplate) {
    if(_.isString(elseTemplate)) return () => elseTemplate
    return elseTemplate() 
  }
}

module.exports = is