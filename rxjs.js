'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeArray = exports.makeSubject = exports.Observable = undefined;

var _Observable = require('rxjs/Observable');

var _Rx = require('rxjs/Rx');

var _Rx2 = _interopRequireDefault(_Rx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function makeSubject() {
  var stream = new _Rx2.default.Subject();
  var observer = {
    next: function next(x) {
      stream.next(x);
    },
    error: function error(err) {
      stream.error(err);
    },
    complete: function complete() {
      stream.complete();
    }
  };
  return { stream: stream, observer: observer };
}

function mergeArray(arr) {
  return _Observable.Observable.merge.apply(_Observable.Observable, _toConsumableArray(arr)).share();
}

_Observable.Observable.prototype.bulkMap = function (cb) {
  return this.switchMap(function (val) {
    return _Observable.Observable.of.apply(_Observable.Observable, _toConsumableArray(cb(val)));
  });
};
_Observable.Observable.prototype.reducer = function (reducer) {
  var _arguments = arguments;

  if (arguments.length > 1) {
    return this.bulkMap(function (action) {
      var reducers = [];
      for (var i = 0; i < _arguments.length; i++) {
        reducers.push({ reducer: _arguments[i], action: action });
      }
      return reducers;
    });
  }
  return this.map(function (action) {
    return { reducer: reducer, action: action };
  });
};
_Observable.Observable.prototype.filterByType = function (type) {
  return this.filter(function (action) {
    return action.type === type;
  });
};

_Observable.Observable.prototype.mapCatched = function (cb) {
  return this.catch(function (e) {
    return [cb(e)];
  });
};

exports.Observable = _Observable.Observable;
exports.makeSubject = makeSubject;
exports.mergeArray = mergeArray;