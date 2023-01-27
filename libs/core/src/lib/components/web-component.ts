import { BehaviorSubject, bufferTime, Subject, takeUntil } from 'rxjs';
import {
  WebComponentAttributeChanged,
  WebComponentEffects,
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

  values = {
    ...this.defaults,
  };

  changes = Object.keys(this.subjects).reduce(
    (acc, key) => Object.assign(acc, { [key]: this.subjects[key as keyof T] }),
    {} as WebComponentObservables<T>
  );

  private attributeChangedSub = new Subject<WebComponentAttributeChanged<T>>();
  protected disconnectedSub = new Subject<void>();

  private attributeChanges$ = this.attributeChangedSub.pipe(bufferTime(0));

  constructor(
    private defaults: T,
    private parsers: WebComponentParsers<T>,
    private effects: Partial<WebComponentEffects<T>>
  ) {
    super();
    this.subscribeToAttributeChanges();
  }

  attributeChangedCallback(name: keyof T, oldValue: string, newValue: string) {
    if (oldValue === newValue) {
      return;
    }

    this.attributeChangedSub.next({
      name,
      value: newValue,
    });
  }

  connectedCallback(): void {
    for (const [key, value] of Object.entries(this.defaults)) {
      this.updateValue(key as keyof T, value);
    }
  }

  disconnectedCallback(): void {
    this.disconnectedSub.next();
    this.disconnectedSub.complete();
  }

  private subscribeToAttributeChanges(): void {
    this.attributeChanges$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe((attributeChanges) => {
        for (const attributeChange of attributeChanges) {
          this.updateValue(
            attributeChange.name,
            this.parsers[attributeChange.name](attributeChange.value)
          );
        }
      });
  }

  private updateValue<K extends keyof T>(name: K, value: T[K]): void {
    this.values[name] = value;
    this.subjects[name].next(value);

    const effect = this.effects[name];
    if (effect) {
      effect(value);
    }
  }
}
