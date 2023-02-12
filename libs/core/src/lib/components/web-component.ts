import {
  asapScheduler,
  BehaviorSubject,
  buffer,
  debounceTime,
  filter,
  Observable,
  OperatorFunction,
  share,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  RequireAll,
  WebComponentAttributeChanged,
  WebComponentEffects,
  WebComponentInputByAttribute,
  WebComponentObservables,
  WebComponentParsers,
  WebComponentSubjects,
} from './web-component-model';

export class WebComponent<T extends object> extends HTMLElement {
  private subjects = Object.keys(this.defaults).reduce(
    (acc, key) =>
      Object.assign(acc, {
        [key]: new BehaviorSubject(this.defaults[key as keyof T]),
      }),
    {} as WebComponentSubjects<T>
  );

  values: RequireAll<T> = {
    ...this.defaults,
  };

  changes = Object.keys(this.subjects).reduce(
    (acc, key) => Object.assign(acc, { [key]: this.subjects[key as keyof T] }),
    {} as WebComponentObservables<T>
  );

  protected disconnectedSub = new Subject<void>();
  private attributeChangedSub = new Subject<WebComponentAttributeChanged<T>>();

  private attributeChanges$ = this.attributeChangedSub.pipe(
    this.bufferDebounceTime(0)
  );

  constructor(
    private defaults: RequireAll<T>,
    private parsers: WebComponentParsers<T>,
    private effects: Partial<WebComponentEffects<T>>,
    private attributeNames: WebComponentInputByAttribute<T>
  ) {
    super();
    this.subscribeToAttributeChanges();

    for (const [key, value] of Object.entries(this.defaults)) {
      this.attributeChangedSub.next({
        name: key as keyof T,
        value: value as T[keyof T],
      });
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }

    const attributeName = this.attributeNames[name];

    this.attributeChangedSub.next({
      name: attributeName,
      value:
        newValue === ''
          ? this.defaults[attributeName]
          : this.parsers[attributeName](newValue),
    });
  }

  disconnectedCallback(): void {
    this.disconnectedSub.next();
    this.disconnectedSub.complete();
  }

  private subscribeToAttributeChanges(): void {
    this.attributeChanges$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe((attributes) => {
        for (const { name, value } of attributes) {
          this.values[name] = value;
          this.subjects[name].next(value);
        }

        for (const attribute of attributes) {
          this.callEffect(attribute.name);
        }
      });
  }

  private callEffect(name: keyof T): void {
    const effect = this.effects[name];

    if (effect) {
      effect();
    }
  }

  private bufferDebounceTime<T>(duration: number): OperatorFunction<T, T[]> {
    return (source: Observable<T>) => {
      const shared = source.pipe(share());

      return shared.pipe(
        buffer(shared.pipe(debounceTime(duration, asapScheduler))),
        filter((buffer) => buffer.length > 0)
      );
    };
  }
}
