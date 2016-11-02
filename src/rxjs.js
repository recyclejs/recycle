import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import Rx from 'rxjs/Rx'

function makeSubject() {
  var stream = new Subject();
  var observer = {
      next: function (x) { stream.next(x); },
      error: function (err) { stream.error(err); },
      complete: function () { stream.complete(); },
  };
  return { stream: stream, observer: observer };
}

function mergeArray(arr) {
  return Observable.merge(...arr).share()
}

Observable.prototype.bulkMap = function(cb) {
  return this.switchMap(val => Observable.of(...cb(val)))
}
Observable.prototype.reducer = function(reducer) {
  if (arguments.length > 1) {
    return this.bulkMap(action => {
      let reducers = []
      for (let i=0; i<arguments.length; i++) {
        reducers.push({reducer: arguments[i], action})
      }
      return reducers
    })
  }
  return this.map(action => ({reducer, action}))
}
Observable.prototype.filterByType = function(type) {
  return this.filter(action => action.type === type)
}

Observable.prototype.mapCatched = function(cb) {
  return this.catch(e => [cb(e)])
}

export {
  Subject, 
  Observable, 
  makeSubject,
  mergeArray
}