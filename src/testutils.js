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
        if (!refsSubjects.has(selector)) {
          refsSubjects.set(selector, {})
        }

        if (!refsSubjects.get(selector)[event]) {
          refsSubjects.get(selector)[event] = new Subject()
        }

        return refsSubjects.get(selector)[event]
      }
    }
  }
}

function createDOMHandlers (DOMstreams, testStream) {
  return function (selector, event, input) {
    if (!DOMstreams.get(selector) || !DOMstreams.get(selector)[event]) {
      return new Promise(function (resolve, reject) {
        reject(`${event} event on ${(typeof selector === 'function') ? selector.name : selector} is not defined`)
      })
    }

    if (typeof input === 'string') {
      input = { target: { value: input } }
    }
    return createPromise(testStream, DOMstreams.get(selector)[event], input)
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
  const DOMstreams = new Map()

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
