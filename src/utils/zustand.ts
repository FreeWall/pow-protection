import type { StoreApi } from 'zustand';

type FunctionSetterArg<S> = (prevState: S) => S;
type SetterArg<S> = S | FunctionSetterArg<S>;
export type Setter<S> = (arg: SetterArg<S>) => void;

export function createSetter<T>(
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  key: keyof T,
) {
  return <S>(arg: SetterArg<S>): void => {
    if (typeof arg === 'function') {
      const prevState = get()[key];
      const data = (arg as FunctionSetterArg<any>)(prevState);

      set({ [key]: data } as Record<typeof key, any>);
    } else {
      set({ [key]: arg } as Record<typeof key, any>);
    }
  };
}
