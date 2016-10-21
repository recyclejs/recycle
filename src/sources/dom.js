/**
 * @function getDOMSource
 * @desc Wraps recycleComponent in Cycle.js main function
 * with DOM as default driver and rxjs as adapter
 *
 * @param {Object/string} target - target DOM element
 * @return {Function} run - starting function
 */

import rxjsAdapter from '../rxjs/adapter'

export default function getDOMSource(target) {
  return function run(recycleComponent, rootComponent, additionalSources) {

    function main(sources) {
      return {
        DOM: recycleComponent({
          DOM: sources.DOM, 
          adapter: rxjsAdapter, 
          additionalSources
        }).render(rootComponent)
      }
    }

    const drivers = {
      DOM: rxjsAdapter.makeDOMDriver(target)
    }

    rxjsAdapter.run(main, drivers)
  }
}
