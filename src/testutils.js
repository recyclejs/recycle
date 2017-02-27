export function applyReducer ({ action, reducer }, state) {
  return reducer(state, action)
}

export function streamToPromise (testStream, action) {
  return new Promise(function (resolve, reject) {
    let inError = false
    let timeout = null

    testStream.take(1).subscribe(val => {
      if (!inError) {
        clearTimeout(timeout)
        resolve(val)
      }
    })

    timeout = setTimeout(function () {
      inError = true
      reject()
    }, 250)

    if (action) {
      action()
    }
  })
}
