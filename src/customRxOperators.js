export const reducer = (reducerFn) => (stream) =>
  stream.map(event => ({ reducer: reducerFn, event }))
