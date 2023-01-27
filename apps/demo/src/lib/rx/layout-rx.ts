import { Injectable } from '@angular/core';
import { BERG_LAYOUT_DEFAULT_INPUTS } from '@berg-layout/angular';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Layout,
  ObservableProperties,
  Panel,
  SlotWithInputs,
} from './layout-model';
import { toCss, toHtml, toScss } from './layout-util';

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

  edit$ = new BehaviorSubject(this.slots[3]);

  top = this.createPanelInputs('top');
  right = this.createPanelInputs('right');
  bottom = this.createPanelInputs('bottom', true);
  left = this.createPanelInputs('left');

  layout = {
    theme: new BehaviorSubject('Dark'),
    resizeDisabled: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.resizeDisabled
    ),
    resizeTwoDimensions: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.resizeTwoDimensions
    ),
    resizePreviewDelay: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.resizePreviewDelay
    ),
    topLeftPosition: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.topLeftPosition
    ),
    topRightPosition: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.topRightPosition
    ),
    bottomLeftPosition: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.bottomLeftPosition
    ),
    bottomRightPosition: new BehaviorSubject(
      BERG_LAYOUT_DEFAULT_INPUTS.bottomRightPosition
    ),
    topInset: new BehaviorSubject(BERG_LAYOUT_DEFAULT_INPUTS.topInset),
    rightInset: new BehaviorSubject(BERG_LAYOUT_DEFAULT_INPUTS.rightInset),
    bottomInset: new BehaviorSubject(BERG_LAYOUT_DEFAULT_INPUTS.bottomInset),
    leftInset: new BehaviorSubject(BERG_LAYOUT_DEFAULT_INPUTS.leftInset),
  };

  layout$: Observable<Layout> = combineLatest([
    this.observeProperties(this.top),
    this.observeProperties(this.right),
    this.observeProperties(this.bottom),
    this.observeProperties(this.left),
    this.observeProperties(this.layout),
  ]).pipe(
    map(([top, right, bottom, left, layout]) => {
      return {
        ...layout,
        top,
        right,
        bottom,
        left,
      };
    })
  );

  angularHtml$: Observable<string> = this.layout$.pipe(
    map((layout) => toHtml(layout, false))
  );

  webComponentHtml$: Observable<string> = this.layout$.pipe(
    map((layout) => toHtml(layout, true))
  );

  css$: Observable<string> = this.layout.theme.pipe(
    map((style) => toCss(style))
  );

  scss$: Observable<string> = this.layout.theme.pipe(
    map((style) => toScss(style))
  );

  private createPanelInputs(slot: SlotWithInputs, collapsed = false) {
    return {
      slot: of(slot),
      absolute: new BehaviorSubject(false),
      collapsed: new BehaviorSubject(collapsed),
      remove: new BehaviorSubject(false),
      resizeDisabled: new BehaviorSubject(false),
    };
  }

  private observeProperties<T>(
    properties: ObservableProperties<T>
  ): Observable<T> {
    return combineLatest(
      Object.entries(properties).map(([key, observable]) => {
        // the rxjs map overload is acting up
        return (observable as any).pipe(
          map((value: any) => {
            return { [key]: value };
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
        }, {} as Panel);
      })
    );
  }
}
