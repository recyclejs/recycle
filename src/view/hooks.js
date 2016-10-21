// view hook helpers
export const onUpdate = (fn) => ({ update: (old, {elm}) => fn(elm) })
export const forceVal = (val) => onUpdate(elm => (typeof val === 'string') ? elm.value = val : null)