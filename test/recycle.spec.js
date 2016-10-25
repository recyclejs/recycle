import {expect} from 'chai';
import ReCycle from '../src/index'

it('should throw an error', () => {
  expect(ReCycle).to.throw('No adapter provided');
});