/**
 * TODO: Insert JSDoc
 */


import {Observable} from 'rxjs'
import {JSX} from 'react'
import * as React from 'react'


export = recycle
declare const recycle: recycle.Recycle
export as namespace recycle


type ReducerFn<S> = (state: S) => S
type ReducerObservableFn<S> = (stream: Observable<Event>) => Observable<{ reducer: ReducerFn<S>, event: Event }>


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
        reducer(reducerFn: ReducerFn): ReducerObservableFn
    }
}


declare namespace recycle {

    interface Listeners<S> {
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

    interface Sources<S> {
        select: (tagName: string) => recycle.Listeners
        select: (childComponent: string) => recycle.Listeners
        selectClass: (className: string) => recycle.Listeners
        selectId: (id: string) => recycle.Listeners

        store: Observable<S>
        state: Observable<S>

        lifecycle: Observable<ReactLifeCycle>
    }

    interface Params<S> {
        propTypes?: any
        displayName?: string
        initialState?: S
        dispatch?: (sources: recycle.Sources<S>) => Observable
        update?: (sources: recycle.Sources<S>) => ReducerObservableFn<S>[]
        effects?: (sources: recycle.Sources<S>) => Observable[]
        view?: (props: any, state: S) => JSX.Element
    }

    interface Recycle {
        <S>(params: recycle.Params<S>): React.Component
    }
}
