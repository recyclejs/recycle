## Recycle RxJS Operators
In addition to RxJS operators there are also Recycle-specific operators which you can use:

*  `reducer` - used for defining component reducers
*  `filterByType` - shorthand for `filter(action => action.type === type)`
*  `filterByConstructor` - shorthand for `filter(action => action.childConstructor === constructor)`
*  `mapToLatest` - used for retriving component state or props