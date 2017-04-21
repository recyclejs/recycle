function getNodeSelectors (nodeName, attrs) {
  let selectors = []

  let tag = (typeof nodeName === 'string') ? nodeName : undefined
  let id = (attrs) ? attrs.id : undefined
  let className = (attrs) ? attrs.className : undefined
  let functionSelector = (typeof nodeName === 'function' || typeof nodeName === 'object') ? nodeName : undefined

  if (tag) {
    selectors.push({ selector: tag, selectorType: 'tag' })
  }

  if (functionSelector) {
    selectors.push({ selector: functionSelector, selectorType: 'tag' })
  }

  if (className) {
    let classes = className.split(' ').map(classNcame => ({ selector: className, selectorType: 'class' }))
    selectors = selectors.concat(classes)
  }

  if (id) {
    selectors.push({ selector: id, selectorType: 'id' })
  }

  return selectors
}

export default getNodeSelectors
