import { Observable, Subject } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Connectable<T = any> = Subject<T> | Observable<T> | T | null;
