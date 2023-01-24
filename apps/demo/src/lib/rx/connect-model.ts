import { Observable, Subject } from 'rxjs';

export type Connectable<T = any> = Subject<T> | Observable<T> | T | null;
