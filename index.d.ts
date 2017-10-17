/**
 * TODO: Insert JSDoc
 */

import {Observable} from 'rxjs'
import * as React from 'react'
import {Action} from 'redux'


export = recycle
declare const recycle: recycle.Recycle
export as namespace recycle


type ReducerFn<S, R> = (state: S, value?: any, store?: R) => S
type ReducerObservableFn<S, R> = (stream: Observable<Event>) => Observable<{ reducer: ReducerFn<S, R>, event: Event }>


type DomEvent =
    'onClick' |
    'onKeyUp' |
    'onKeyDown' |
    'onKeyPress' |
    'onBlur' |
    'onChange' |
    'onClose' |
    'onFocus' |
    'onInput' |
    'onMouseMove' |
    'onMouseDown' |
    'onMouseUp' |
    'onMouseOut' |
    'onMouseOver' |
    'onScroll' |
    'onSubmit' |
    'onSelect' |
    'onTouchMove' |
    'onTouchCancel' |
    'onTouchStart' |
    'onWheel'


declare module 'rxjs/Observable' {
    interface Observable<T> {
        /**
         *  Acts like a Redux reducer, it receives you local component state (and your Redux state, if you are using Redux),
         *  and returns a new local state
         *
         * @template S Your Component local state
         * @template R Your Redux state
         * @param {(state: S, store: R) => S} reducerFn PS: Param store only appears if you are using Redux (Component is inside Provider)
         * @example
         *
         * sources.select('button')
         *    .addListener('onClick')
         *    .reducer((state, eventValue) => {
         *        ...state,
         *        counter: state.counter + eventValue
         *    })
         *
         */
        reducer<S, R>(reducerFn: ReducerFn<S, R>): ReducerObservableFn<S, R>
    }
}


declare namespace recycle {

    interface Listeners {

        /**
         * Register a new DOM listener and returns a stream of DOM events
         *
         * @param event DOM Event to listen to
         * @returns {Observable<Event>}
         * @example
         *
         * sources.select('button')
         *     .addListener('onClick')
         *     .reducer(state => {
         *         ...state,
         *         counter: state.counter + 1
         *     }),
         *
         */
        addListener: (event: DomEvent) => Observable<Event>
    }

    type ReactLifeCycle =
        'componentWillMount' |
        'componentDidMount' |
        'componentWillReceiveProps' |
        'shouldComponentUpdate' |
        'componentWillUpdate' |
        'componentDidUpdate' |
        'componentWillUnmount'

    interface Sources<S, R> {

        /**
         * This method selects a element by tagName or a ChildComponent and returns a recycle.Listeners
         *
         * @param param
         * @returns {recycle.Listeners} Returns { addListener: (event: DomEvent) => Observable<Event> }
         * @example
         *
         * PS: Assuming i have a <button></button>
         * sources.select('button')
         *
         * or
         *
         * PS: Assuming i have a <ChildComponent></ChildComponent> as a child element.
         * sources.select(ChildComponent)
         *
         */
        select: (param: string) => recycle.Listeners

        /**
         * This method selects a element by a CSS class and returns a recycle.Listeners
         *
         * @param className
         * @returns {recycle.Listeners} Returns { addListener: (event: DomEvent) => Observable<Event> }
         * @example
         *
         * * PS: Assuming i have a <Element class='cssClass'></Element> as a child element.
         * sources.select('cssClass')
         *
         */
        selectClass: (className: string) => recycle.Listeners

        /**
         * This method selects a element by id and returns a recycle.Listeners
         *
         * @param id
         * @returns {recycle.Listeners} Returns { addListener: (event: DomEvent) => Observable<Event> }
         * @example
         *
         * PS: Assuming i have a <Element id='elementId'></Element> as a child element.
         * sources.select('elementId')
         *
         */
        selectId: (id: string) => recycle.Listeners

        /**
         * If you are using Redux (component is inside Provider) this will return a stream of your redux state
         *
         * @template R is a interface representing your Redux state
         * @returns {Observable<R>} Returns a Observable with your latest Redux state
         * @example
         *
         * PS: Assuming R is { count: number }
         * sources.store.map((state: { count: number }) => state.count)
         *
         */
        store?: Observable<R>

        /**
         * Returns a stream of your local component state
         *
         * @template S is a interface representing your Component state
         * @returns {Observable<S>} Returns a Observable with your latest component state
         * @example
         *
         * sources.select('input')
         *     .addListener('onKeyPress')
         *     .filter(e => e.key === 'Enter')
         *     .withLatestFrom(sources.state)
         *     .map(([e, state]) => state.someStateValue)
         *
         */
        state: Observable<S>

        /**
         * Returns a stream of component lifecycle events
         *
         * @returns {Observable<ReactLifeCycle>}
         * @example
         *
         * sources.lifecycle
         *     .filter(e => e === 'componentDidMount')
         *     .do(something)
         *
         */
        lifecycle: Observable<ReactLifeCycle>
    }

    interface Params<S, R> {
        propTypes?: any
        displayName?: string
        initialState?: S
        dispatch?: (sources: recycle.Sources<S, R>) => Observable<Action>
        update?: (sources: recycle.Sources<S, R>) => ReducerObservableFn<S, R>[]
        effects?: (sources: recycle.Sources<S, R>) => Observable<any>[]
        view?: (props: any, state: S) => JSX.Element
    }

    interface Recycle {
        <S, R=any>(params: recycle.Params<S, R>): React.Component
    }
}
