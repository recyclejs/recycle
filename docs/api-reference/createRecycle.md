## createRecycle

#### Arguments
* `config` *(Object)*: An object representing a config for creating a Recycle instance.
  * `adapter` *(Object)*: [adapter instance](adapter.md) *(required)*
  * `plugins` *(array)*: list of [plugins](Plugins.md) *(optional)*

#### Returns
Recycle instance - An object with following methods:
 * `render` *(Function)*
  * `constructor` *(Function)*: component constructor function used for creating a root component *(required)*
  * `props` *(Object)*: props passed to the root component *(optional)*
  * `target` *(Object)*: DOM element where the component should be rendered *(required)*
 * `toReact` *(Function)*: function which return React component created from Recycle component
  * `constructor` *(Function)*: component constructor function that should be converted in React
 * `getAllComponents` *(Function)*: function which returns list of all Recycle components
 * `getComponentStructure` *(Function)*: function which returns a tree of all Recycle components