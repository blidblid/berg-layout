import {
  EMPTY,
  merge,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
} from 'rxjs';
import {
  filter,
  map,
  pairwise,
  scan,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { BergPanelResizeSize } from './panel-model';

export type UpdateValue<T> = { oldValue: T; newValue: T };

export function arrayReducer<T>(observables: {
  add?: Observable<T>;
  clear?: Observable<any>;
  push?: Observable<any>;
  remove?: Observable<T>;
  update?: Observable<UpdateValue<T>>;
}): Observable<T[]> {
  const {
    add = EMPTY,
    clear = EMPTY,
    push = EMPTY,
    remove = EMPTY,
    update = EMPTY,
  } = observables;

  return merge(
    add.pipe(map<T, ReducerAction<T>>((value) => ({ value, action: 'add' }))),
    clear.pipe(map<T, ReducerAction<T>>(() => ({ action: 'clear' }))),
    push.pipe(map<T, ReducerAction<T>>(() => ({ action: 'push' }))),
    remove.pipe(
      map<T, ReducerAction<T>>((value) => ({ value, action: 'remove' }))
    ),
    update.pipe(
      map<UpdateValue<T>, UpdateAction<T>>((value) => ({
        ...value,
        action: 'update',
      }))
    )
  ).pipe(actionArrayReducer());
}

export function actionArrayReducer<T>(): OperatorFunction<
  ReducerAction<T>,
  T[]
> {
  return (source$) =>
    source$.pipe(
      scan((acc, curr) => {
        switch (curr.action) {
          case 'add':
            return [...acc, curr.value];
          case 'clear':
            return [];
          case 'push':
            return acc;
          case 'remove':
            return acc.filter((a) => a !== curr.value);
          case 'update':
            return acc.map((a) => (a === curr.oldValue ? curr.newValue : a));
          default:
            return acc;
        }
      }, [] as T[]),
      shareReplay({ bufferSize: 1, refCount: true })
    );
}

export interface AddAction<T> {
  action: 'add';
  value: T;
}

export interface ClearAction {
  action: 'clear';
}

export interface PushAction {
  action: 'push';
}

export interface RemoveAction<T> {
  action: 'remove';
  value: T;
}

export interface UpdateAction<T> {
  action: 'update';
  newValue: T;
  oldValue: T;
}

export type ReducerAction<T> =
  | AddAction<T>
  | ClearAction
  | PushAction
  | RemoveAction<T>
  | UpdateAction<T>;

export function filterSizeDirection(
  increases = true
): MonoTypeOperatorFunction<BergPanelResizeSize> {
  return (source) =>
    source.pipe(
      startWith(null),
      pairwise(),
      filter(([prev, curr]) => {
        if (curr === null || prev === null) {
          return true;
        }

        return increases ? isLargerSize(curr, prev) : isLargerSize(prev, curr);
      }),
      map(([_, curr]) => curr as BergPanelResizeSize)
    );
}

export function isLargerSize(
  size: BergPanelResizeSize,
  compareWith: BergPanelResizeSize
): boolean {
  if (size.width && compareWith.width) {
    return size.width > compareWith.width;
  }

  if (size.height && compareWith.height) {
    return size.height > compareWith.height;
  }

  return false;
}
