import { Observable } from 'rxjs';

export type ObservableProperties<T> = {
  [P in keyof T]: Observable<T[P]>;
};
