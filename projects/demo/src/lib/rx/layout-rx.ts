import { Injectable } from '@angular/core';
import { BERG_LAYOUT_DEFAULT_INPUTS } from '@berg-layout/angular';
import { userInput } from '@berglund/rx';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Layout, ObservableProperties, Panel, Slot } from './layout-model';
import { toHtml } from './layout-util';

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

  edit$ = userInput(this.slots[3]);

  top = this.createPanelInputs('top');
  right = this.createPanelInputs('right');
  bottom = this.createPanelInputs('bottom');
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

  private createLayoutInputs() {
    return {
      resizeDisabled: userInput(BERG_LAYOUT_DEFAULT_INPUTS.resizeDisabled),
      resizeTwoDimensions: userInput(
        BERG_LAYOUT_DEFAULT_INPUTS.resizeTwoDimensions
      ),
      resizeCollapseOffset: userInput(
        BERG_LAYOUT_DEFAULT_INPUTS.resizeCollapseOffset
      ),
      resizeExpandOffset: userInput(
        BERG_LAYOUT_DEFAULT_INPUTS.resizeExpandOffset
      ),
      resizePreviewDelay: userInput(
        BERG_LAYOUT_DEFAULT_INPUTS.resizePreviewDelay
      ),
    };
  }

  private createPanelInputs(slot: Slot) {
    return {
      slot: of(slot),
      absolute: userInput(false),
      collapsed: userInput(false),
      remove: userInput(false),
      resizeDisabled: userInput(false),
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
