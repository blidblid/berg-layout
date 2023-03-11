import { Injectable } from '@angular/core';
import {
  BergLayoutInputs,
  BERG_LAYOUT_DEFAULT_INPUTS,
} from '@berg-layout/angular';
import {
  BergPanelInputs,
  BergPanelSlot,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ObservableProperties } from './layout-model';

@Injectable({
  providedIn: 'root',
})
export class LayoutRx {
  slots = [
    { slot: 'top', name: 'Top' },
    { slot: 'right', name: 'Right' },
    { slot: 'bottom', name: 'Bottom' },
    { slot: 'left', name: 'Left' },
  ];

  edit = new BehaviorSubject(this.slots[3]);
  theme = new BehaviorSubject('Dark');

  top = this.createPanelInputs('top');
  right = this.createPanelInputs('right');
  bottom = this.createPanelInputs('bottom');
  left = this.createPanelInputs('left');

  remove = {
    top: new BehaviorSubject(false),
    right: new BehaviorSubject(false),
    bottom: new BehaviorSubject(false),
    left: new BehaviorSubject(false),
  };

  layout = Object.entries(BERG_LAYOUT_DEFAULT_INPUTS).reduce(
    (acc, [key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc as any)[key] = new BehaviorSubject(value);
      return acc;
    },
    {} as {
      [P in keyof BergLayoutInputs]: BehaviorSubject<BergLayoutInputs[P]>;
    }
  );

  layout$: Observable<BergLayoutInputs> = this.observeProperties(this.layout);

  top$: Observable<BergPanelInputs> = this.observeProperties(this.top);
  right$: Observable<BergPanelInputs> = this.observeProperties(this.right);
  bottom$: Observable<BergPanelInputs> = this.observeProperties(this.bottom);
  left$: Observable<BergPanelInputs> = this.observeProperties(this.left);

  remove$ = this.observeProperties(this.remove);

  inputs$ = combineLatest([
    this.layout$,
    this.top$,
    this.right$,
    this.bottom$,
    this.left$,
    this.remove$,
  ]).pipe(
    map(([layout, top, right, bottom, left, remove]) => {
      return {
        layout,
        top,
        right,
        bottom,
        left,
        remove,
      };
    })
  );

  constructor() {
    this.changeDefaults();
  }

  private changeDefaults(): void {
    this.bottom.collapsed.next(true);
    this.left.collapsed.next(true);
  }

  private createPanelInputs(slot: BergPanelSlot): {
    [P in keyof BergPanelInputs]: BehaviorSubject<BergPanelInputs[P]>;
  } {
    return Object.entries(BERG_PANEL_DEFAULT_INPUTS).reduce(
      (acc, [key, value]) => {
        if (key === 'slot') {
          acc[key] = new BehaviorSubject(slot);
        } else {
          acc[key] = new BehaviorSubject(value);
        }

        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any
    );
  }

  private observeProperties<T>(
    properties: ObservableProperties<T>
  ): Observable<T> {
    return combineLatest(
      Object.entries(properties).map(([key, observable]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (observable as any).pipe(
          distinctUntilChanged(),
          map((value) => {
            return { [key]: value ?? (BERG_PANEL_DEFAULT_INPUTS as any)[key] };
          })
        );
      })
    ).pipe(
      map((properties) => {
        return properties.reduce((acc, curr) => {
          return {
            ...acc,
            ...curr,
          };
        }, {} as T);
      })
    );
  }
}
