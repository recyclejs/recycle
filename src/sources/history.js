/**
 * @function getRouteHistory
 * @desc creates rxjs stream for listening route changes
 *
 */

import {captureClicks} from '@cycle/history/lib/captureClicks'
import rxjsAdapter from '@cycle/rxjs-adapter'
import createHistory from 'history/createBrowserHistory'

let history$;
export default function getRouteHistory(dontCapture) {
  if (history$)
    return history$;

  const history = createHistory()
  let {observer, stream} = rxjsAdapter.makeSubject();
  history$ = rxjsAdapter.remember(stream
        .startWith(history.location)
        .filter(Boolean));

  history.listen((location) => {
    observer.next(location);
  });

  if (!dontCapture) {
    captureClicks((pathname) => {
      history.push(pathname);
    });
  }
  
  return history$;
}