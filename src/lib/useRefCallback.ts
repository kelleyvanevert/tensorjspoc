import {useCallback, useRef} from 'react';

/**
 * For if you want a stable-identity callback that uses the most recent render's surrounding scope, without having to think too much about it, but also pleasing the React rules of hooks linter.
 */
export function useRefCallback<Args extends any[], Result>(
  callback: (...args: Args) => Result,
): ((...args: Args) => Result) & {provided: true};

export function useRefCallback<Args extends any[], Result>(
  callback?: (...args: Args) => Result,
): ((...args: Args) => undefined | Result) & {provided: boolean};

export function useRefCallback<Args extends any[], Result>(
  callback?: (...args: Args) => undefined | Result,
): ((...args: Args) => Result) & {provided: boolean} {
  // re-assign on every render
  const ref = useRef(callback);
  ref.current = callback;

  const wrapper = useCallback((...args: Args) => {
    if (ref.current) {
      return ref.current(...args);
    }
  }, []);

  // @ts-ignore
  wrapper.provided = !!callback;

  // @ts-ignore
  return wrapper;
}
