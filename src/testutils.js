import { Observable, Subject } from './index'

function createPromise (testStream, inputSource, val) {
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

    inputSource.next(val)
  })
}

function createNodeSelectors (refsSubjects) {
  return function (selector) {
    return {
      on: function (event, all) {
        if (!refsSubjects[selector]) {
          refsSubjects[selector] = {}
        }

        if (!refsSubjects[selector][event]) {
          refsSubjects[selector][event] = new Subject()
        }

        return refsSubjects[selector][event]
      }
    }
  }
}

function createDOMHandlers (DOMstreams, testStream) {
  return function (selector, event, input) {
    if (!DOMstreams[selector] || !DOMstreams[selector][event]) {
      return new Promise(function (resolve, reject) {
        reject(`${event} event on ${selector} is not defined`)
      })
    }

    if (typeof input === 'string') {
      input = { target: { value: input } }
    }
    return createPromise(testStream, DOMstreams[selector][event], input)
  }
}

export function inspectObservable (testFun, userSourcesList) {
  const sourcesList = Object.assign({}, {
    childrenActions: 'childrenActions',
    actions: 'actions',
    props: 'props',
    state: 'state',
    select: 'select',
    selectClass: 'selectClass',
    selectId: 'selectId'
  }, userSourcesList)

  let testStream = new Subject()
  const api = {}
  const sources = {}
  const DOMstreams = {}

  for (let source in sourcesList) {
    if (source === 'select' || source === 'selectClass' || source === 'selectId') {
      sources[source] = createNodeSelectors(DOMstreams)
      api[sourcesList[source]] = createDOMHandlers(DOMstreams, testStream)
    } else {
      sources[source] = new Subject()
      api[sourcesList[source]] = (val) => createPromise(testStream, sources[source], val)
    }
  }

  Observable.merge(...testFun(sources)).subscribe(testStream)
  return api
}

export function applyReducer ({ action, reducer }, state) {
  return reducer(state, action)
}
