function shallowClone (data) {
  if (Array.isArray(data)) {
    return data.map(i => i)
  } else if (typeof data === 'object') {
    return {...data}
  }
  return data
}

export default shallowClone
