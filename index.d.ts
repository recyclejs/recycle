import {Observable} from 'rxjs'
import * as React from 'react'
import {AnyAction} from 'redux'


export declare const recycle: recycle.Recycle
export default recycle
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

    interface Listeners<T> {

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
        addListener: (event: T) => Observable<Event>
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
        select: <CP={}, CS={}>(param: string | React.Component<CP, CS> | React.StatelessComponent<CP>) => recycle.Listeners<DomEvent | keyof CP>;

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
        selectClass: <CP={}>(className: string) => recycle.Listeners<DomEvent | keyof CP>;

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
        selectId: <CP={}>(id: string) => recycle.Listeners<DomEvent | keyof CP>

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
        /**
         * React props passed by JSX
         */
        propTypes?: any

        /**
         * Determines the html tag name
         */
        displayName?: string

        /**
         * Component's local initial state
         */
        initialState?: S

        /**
         *
         *
         * @param sources
         * @returns {Observable<AnyAction>[]} Array of Redux action streams
         */
        dispatch?: (sources: recycle.Sources<S, R>) => Observable<AnyAction>[]

        /**
         * Acts like a Redux reducer for the component local state
         *
         * @param sources
         * @template S Interface representing the component local state
         * @template R Interface representing the Redux state (If using Redux)
         * @returns {Observable<ReducerObservableFn<S, R>>[]}
         * @example
         *
         * update: (sources) => {
         *     return [
         *       sources.store
         *         .reducer(function (state, store) {
         *           return state
         *         })
         *     ]
         * },
         *
         */
        update?: (sources: recycle.Sources<S, R>) => ReducerObservableFn<S, R>[]

        /**
         * If you don't need to update a component local state or dispatch Redux action, but you still need to react
         * to some kind of async operation, you can use effects.
         *
         * @param sources
         * @returns Observable<any>[]
         * @example
         *
         * effects: (sources) => {
         *     return [
         *         sources.select('input')
         *           .addListener('onKeyPress')
         *           .withLatestFrom(sources.props)
         *           .map(([e, props]) => {
         *               props.callParentFunction(e.target.value)
         *           })
         *    ]
         * }
         *
         */
        effects?: (sources: recycle.Sources<S, R>) => Observable<any>[]

        /**
         * Returns the JSX to be rendered for the component
         *
         * @param props
         * @param state
         * @returns {JSX.Element}
         * @example
         *
         * view: (props, state) =>
         *     <div>
         *         <div>Seconds Elapsed: {state.secondsElapsed}</div>
         *         <div>Times Clicked: {state.counter}</div>
         *         <button>Click Me</button>
         *     </div>
         *
         */
        view?: (props: any, state: S) => JSX.Element
    }

    interface Recycle {
        <S, R=any>(params: recycle.Params<S, R>): React.Component
    }
}
