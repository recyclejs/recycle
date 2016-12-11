## createRecycle

#### Arguments
* `config` *(Object)*: An object representing a config for creating a Recycle instance.
  * `adapter` *(Object)*: [adapter instance](adapter.md) *(required)*
  * `plugins` *(array)*: list of [plugins](Plugins.md) *(optional)*

#### Returns
Recycle instance - An object with following methods:
 * `render` *(Function)*
  1. `Component` *(Function)*: component function used for creating a root component instance *(required)*
  1. `props` *(Object)*: props passed to the root component *(optional)*
  1. `target` *(Object)*: DOM element where the component should be rendered *(required)*
 * `toReact` *(Function)*: function which return React component created from Recycle component
  1. `Component` *(Function)*: component function that should be converted in React
 * `getAllComponents` *(Function)*: function which returns list of all components
 * `getComponentStructure` *(Function)*: function which returns a tree of all components