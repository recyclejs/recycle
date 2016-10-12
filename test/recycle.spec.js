import {expect} from 'chai';
import ReCycle from '../src/recycle'
import xstreamAdapter from 'recycle-xstream'

it('should throw an error', () => {
  expect(ReCycle).to.throw('No adapter provided');
});

it('should have render method', () => {  
  let app = ReCycle(xstreamAdapter)
  expect(app).to.have.property('render')
});