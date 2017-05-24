export const registerReducer = (reducerFn) => (stream) =>
  stream.map(event => ({ reducer: reducerFn, event }))
