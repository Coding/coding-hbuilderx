import { DependencyList, useCallback, useState, useRef, useEffect } from 'react';
import useMountedState from './useMountedState';

interface IError {
  code: number;
  msg: {
    [key: string]: string;
  };
}

export interface AsyncState {
  loading: boolean;
  error?: IError;
  value?: any;
}

export type AsyncFn = [AsyncState, (...args: any[]) => Promise<any>];

export interface IOptions {
  deps: DependencyList;
  initialState?: AsyncState;
  successHandler?: (value: any) => void;
  errorHandler?: (error: IError) => void;
}

/* tslint:disable */
export default function useAsyncFn(
  fn: (...args: any[]) => Promise<any>,
  options: IOptions = {
    deps: [],
  }
): AsyncFn {
  const { initialState = { loading: false }, deps = [], successHandler, errorHandler } = options;

  const lastCallId = useRef(0);
  const [state, set] = useState<AsyncState>(initialState);

  const isMounted = useMountedState();

  useEffect(() => {
    set(initialState);
  }, deps);

  const callback = useCallback((...args: any[]) => {
    const callId = ++lastCallId.current;
    set({ loading: true, error: undefined });

    return fn(...args).then(
      (value) => {
        const cb = args[args.length - 1];

        if (isMounted() && callId === lastCallId.current) {
          if (successHandler) successHandler(value);
          if (typeof cb === 'function') {
            cb();
          }
          set({ value, loading: false });
        }
        return value;
      },
      (error) => {
        if (isMounted() && callId === lastCallId.current) {
          if (errorHandler) errorHandler(error);
          set({ error, loading: false });
        }
        return null;
      }
    );
  }, deps);

  return [state, callback];
}
