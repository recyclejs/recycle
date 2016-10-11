"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var DOMscope = 0;

var ReCycleComponent = exports.ReCycleComponent = function ReCycleComponent(_ref) {
  var parent = _ref.parent;
  var DOM = _ref.DOM;
  var adapter = _ref.adapter;
  var additionalSources = _ref.additionalSources;


  var childrenComponents = [];
  var actions$ = void 0;
  var childActions = adapter.makeSubject();

  DOM = DOM.isolateSource(DOM, ++DOMscope);
  var componentSources = Object.assign(additionalSources || {}, {
    $: function $(selector) {
      return DOM.select(selector);
    }
  });

  var updateChildActions = function updateChildActions() {
    if (!childrenComponents.length) return;

    childActions.observer.next(adapter.mergeArray(childrenComponents.map(function (component) {
      return component.getActionsStream();
    })));
  };

  var render = function render(_ref2) {
    var view = _ref2.view;
    var actions = _ref2.actions;
    var reducer = _ref2.reducer;
    var children = _ref2.children;
    var initialState = _ref2.initialState;
    var onStateUpdate = _ref2.onStateUpdate;


    var componentActions = actions(componentSources, adapter.flatten(childActions.stream));
    if (!Array.isArray(componentActions)) componentActions = [componentActions];

    actions$ = adapter.mergeArray(componentActions);

    var state$ = adapter.of(initialState);
    if (reducer) {
      var componentReducers = reducer(actions$, componentSources);
      if (!Array.isArray(componentReducers)) componentReducers = [componentReducers];

      state$ = adapter.fold(adapter.mergeArray(componentReducers), function (state, reducer) {
        return reducer(state);
      }, initialState);
    }

    var view$ = state$.map(function (state) {
      clearChildren();

      if (onStateUpdate) onStateUpdate(state);

      return view(state, wrapChildComponents(children));
    });

    if (parent) parent.updateChildActions();

    return DOM.isolateSink(view$, DOMscope);
  };

  var clearChildren = function clearChildren() {
    childrenComponents = [];
  };

  var addChild = function addChild(c) {
    childrenComponents.push(c);
  };

  var getActionsStream = function getActionsStream() {
    return actions$;
  };

  var wrapChildComponents = function wrapChildComponents(children) {
    if (children) {
      var childComponents = {};

      var _loop = function _loop(child) {
        childComponents[child] = function () {
          return ReCycleComponent({
            parent: thisComponent,
            DOM: DOM,
            adapter: adapter,
            additionalSources: additionalSources
          }).render(children[child].apply(children, arguments));
        };
      };

      for (var child in children) {
        _loop(child);
      }
      return childComponents;
    }
  };

  var thisComponent = {
    render: render,
    updateChildActions: updateChildActions,
    addChild: addChild,
    getActionsStream: getActionsStream,
    clearChildren: clearChildren
  };

  if (parent) {
    parent.addChild(thisComponent);
  }

  return thisComponent;
};

function ReCycle(adapter, additionalSources) {
  return function (rootComponent, target) {

    function main(sources) {
      return {
        DOM: ReCycleComponent({
          DOM: sources.DOM,
          adapter: adapter,
          additionalSources: additionalSources
        }).render(rootComponent)
      };
    }

    var drivers = {
      DOM: adapter.makeDOMDriver(target)
    };

    adapter.run(main, drivers);
  };
}

exports.default = function (adapter, sources) {
  return {
    render: ReCycle(adapter, sources)
  };
};