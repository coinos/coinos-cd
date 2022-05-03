const _ = require('underscore')

const is = (condition, template, elseTemplate) => {
  if(condition) {
    if(_.isString(template)) return () => template
    //^ only works for plain strings but not html; use a fn otherwise
    return template() 
  }
  if(elseTemplate) {
    if(_.isString(elseTemplate)) return () => elseTemplate
    return elseTemplate() 
  }
}

module.exports = is