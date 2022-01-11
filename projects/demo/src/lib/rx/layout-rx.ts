import { Injectable } from '@angular/core';
import { BERG_SHARED_DEFAULT_INPUTS } from '@berg-layout/angular';
import { userInput } from '@berglund/rx';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Layout, ObservableProperties, Panel, Slot } from './layout-model';

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

  layout$: Observable<Layout> = combineLatest([
    this.toPanel(this.top),
    this.toPanel(this.right),
    this.toPanel(this.bottom),
    this.toPanel(this.left),
  ]).pipe(
    map(([top, right, bottom, left]) => {
      return {
        top,
        right,
        bottom,
        left,
      };
    })
  );

  private createCommonInputs() {
    return {
      absolute: userInput(false),
      collapsed: userInput(false),
      resizeDisabled: userInput(BERG_SHARED_DEFAULT_INPUTS.resizeDisabled),
      resizeTwoDimensions: userInput(
        BERG_SHARED_DEFAULT_INPUTS.resizeTwoDimensions
      ),
      resizeThreshold: userInput(BERG_SHARED_DEFAULT_INPUTS.resizeThreshold),
      resizeCollapseRatio: userInput(
        BERG_SHARED_DEFAULT_INPUTS.resizeCollapseRatio
      ),
      resizePreviewDelay: userInput(
        BERG_SHARED_DEFAULT_INPUTS.resizePreviewDelay
      ),
    };
  }

  private createPanelInputs(slot: Slot) {
    return {
      slot: of(slot),
      hide: userInput(false),
      ...this.createCommonInputs(),
    };
  }

  private toPanel(properties: ObservableProperties<Panel>): Observable<Panel> {
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
