import { BehaviorSubject, Observable } from 'rxjs';

export type WebComponentParsers<T> = {
  [P in keyof T]: (value: string) => T[P];
};

export type WebComponentSubjects<T> = {
  [P in keyof T]: BehaviorSubject<T[P]>;
};

export type WebComponentObservables<T> = {
  [P in keyof T]: Observable<T[P]>;
};

export type WebComponentEffects<T> = {
  [P in keyof T]: () => void;
};

export interface WebComponentAttributeChanged<T> {
  name: keyof T;
  value: T[keyof T];
}

export type RequireAll<T> = {
  [P in keyof T]-?: T[P];
};
