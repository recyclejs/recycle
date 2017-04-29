function forceArray (arr) {
  if (!Array.isArray(arr)) return [arr]
  return arr
}

export default forceArray
