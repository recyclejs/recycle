import {expect} from 'chai'
import jsdom from 'mocha-jsdom'
import {getDomObservable, updateDomObservables} from './component'
import { Observable, makeSubject, mergeArray, Subject } from './rxjs'


describe('Unit testing', function() {
  describe('getDomObservable()', function() {
    it('should create subject', function() {
      let domSelectors = {}
      let returned = getDomObservable(domSelectors, 'test', 'click')
      expect(returned instanceof Subject).to.equal(true);
    });

    it('should return previously created subject', function() {
      let domSelectors = {}

      getDomObservable(domSelectors, 'test', 'click')
      let firstObserver = domSelectors.test.click
      getDomObservable(domSelectors, 'test', 'click')
      let secondObserver = domSelectors.test.click

      expect(firstObserver === secondObserver).to.equal(true);
    });
  });

  describe('updateDomObservables()', function() {
    jsdom()
  });
});
