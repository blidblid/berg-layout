import { Injectable } from '@angular/core';
import { BERG_LAYOUT_DEFAULT_INPUTS } from '@berg-layout/angular';
import { userValue } from '@berglund/rx';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Layout, ObservableProperties, Panel, Slot } from './layout-model';
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

  edit$ = userValue(this.slots[3]);

  top = this.createPanelInputs('top');
  right = this.createPanelInputs('right');
  bottom = this.createPanelInputs('bottom', true);
  left = this.createPanelInputs('left');
  layout = this.createLayoutInputs();

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

  layoutStyle$ = userValue<string>('Dark');

  css$: Observable<string> = this.layoutStyle$.pipe(
    map((style) => toCss(style))
  );

  scss$: Observable<string> = this.layoutStyle$.pipe(
    map((style) => toScss(style))
  );

  private createLayoutInputs() {
    return {
      resizeDisabled: userValue(BERG_LAYOUT_DEFAULT_INPUTS.resizeDisabled),
      resizeTwoDimensions: userValue(
        BERG_LAYOUT_DEFAULT_INPUTS.resizeTwoDimensions
      ),
      resizePreviewDelay: userValue(
        BERG_LAYOUT_DEFAULT_INPUTS.resizePreviewDelay
      ),
      topLeftPosition: userValue(BERG_LAYOUT_DEFAULT_INPUTS.topLeftPosition),
      topRightPosition: userValue(BERG_LAYOUT_DEFAULT_INPUTS.topRightPosition),
      bottomLeftPosition: userValue(
        BERG_LAYOUT_DEFAULT_INPUTS.bottomLeftPosition
      ),
      bottomRightPosition: userValue(
        BERG_LAYOUT_DEFAULT_INPUTS.bottomRightPosition
      ),
      topInset: userValue(BERG_LAYOUT_DEFAULT_INPUTS.topInset),
      rightInset: userValue(BERG_LAYOUT_DEFAULT_INPUTS.rightInset),
      bottomInset: userValue(BERG_LAYOUT_DEFAULT_INPUTS.bottomInset),
      leftInset: userValue(BERG_LAYOUT_DEFAULT_INPUTS.leftInset),
    };
  }

  private createPanelInputs(slot: Slot, collapsed = false) {
    return {
      slot: of(slot),
      absolute: userValue(false),
      collapsed: userValue(collapsed),
      remove: userValue(false),
      resizeDisabled: userValue(false),
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
