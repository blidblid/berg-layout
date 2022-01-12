import { Injectable } from '@angular/core';
import {
  BergCheckboxComponent,
  BergInputComponent,
  BergSelectComponent,
} from '@berglund/material';
import { component } from '@berglund/mixins';
import { LayoutRx, Slot } from '@demo/rx';

@Injectable({ providedIn: 'root' })
export class LayoutOperators {
  edit = component({
    component: BergSelectComponent,
    inputs: {
      label: 'Edit panel',
      data: this.layoutRx.slots,
      pluckLabel: (value) => value.name,
      connect: this.layoutRx.edit$,
    },
  });

  top = this.createPanel('top');
  right = this.createPanel('right');
  bottom = this.createPanel('bottom');
  left = this.createPanel('left');
  layout = this.createLayout();

  private createPanel(slot: Slot) {
    return [
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Absolute',
          connect: this.layoutRx[slot].absolute,
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Collapsed',
          connect: this.layoutRx[slot].collapsed,
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Remove',
          connect: this.layoutRx[slot].remove,
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize disabled',
          connect: this.layoutRx[slot].resizeDisabled,
        },
      }),
    ];
  }

  private createLayout() {
    return [
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize disabled',
          connect: this.layoutRx.layout.resizeDisabled,
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize two dimensions',
          connect: this.layoutRx.layout.resizeTwoDimensions,
        },
      }),
      component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize threshold',
          type: 'number',
          connect: this.layoutRx.layout.resizeThreshold,
        },
      }),
      component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize collapsed threshold',
          type: 'number',
          connect: this.layoutRx.layout.resizeCollapseRatio,
        },
      }),
      component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize preview delay',
          type: 'number',
          connect: this.layoutRx.layout.resizePreviewDelay,
        },
      }),
    ];
  }

  constructor(private layoutRx: LayoutRx) {}
}