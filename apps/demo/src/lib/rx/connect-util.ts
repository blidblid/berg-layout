import { filter, isObservable, Observable, Subject, takeUntil } from 'rxjs';
import { Connectable } from './connect-model';

export function connect<T>(
  connectable: Connectable<T>,
  valueChanges: Observable<T>,
  destroyed$: Observable<unknown>,
  writeValue?: (value: T | null) => void
): void {
  let isUserInput = false;

  if (connectable instanceof Subject) {
    valueChanges.pipe(takeUntil(destroyed$)).subscribe((value) => {
      isUserInput = true;
      connectable.next(value);
      isUserInput = false;
    });
  }

  if (!writeValue) {
    return;
  }

  if (!isObservable(connectable)) {
    writeValue(connectable);
    return;
  }

  (connectable as Observable<T>)
    .pipe(
      filter(() => !isUserInput),
      takeUntil(destroyed$)
    )
    .subscribe((value) => writeValue(value));
}

export function getConnectableValue<T>(connectable: Connectable<T>): T | null {
  return isObservable(connectable) ? null : connectable ?? null;
}
