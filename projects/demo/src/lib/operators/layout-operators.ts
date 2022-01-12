import { Injectable } from '@angular/core';
import {
  BergCheckboxComponent,
  BergInputComponent,
  BergSelectComponent,
} from '@berglund/material';
import { component } from '@berglund/mixins';
import { LayoutRx, Slot } from '@demo/rx';
import { map } from 'rxjs';

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

  components$ = this.layoutRx.edit$.pipe(
    map((edit) => Object.values(this[edit.slot as Slot]))
  );

  private createPanel(slot: Slot) {
    return {
      absolute: component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Absolute',
          connect: this.layoutRx[slot].absolute,
        },
      }),
      collapsed: component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Collapsed',
          connect: this.layoutRx[slot].collapsed,
        },
      }),
      hide: component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Hide',
          connect: this.layoutRx[slot].hide,
        },
      }),
      ...this.createCommon(slot),
    };
  }

  private createCommon(slot: Slot) {
    return {
      resizeDisabled: component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize disabled',
          connect: this.layoutRx[slot].resizeDisabled,
        },
      }),
      resizeTwoDimensions: component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize two dimensions',
          connect: this.layoutRx[slot].resizeTwoDimensions,
        },
      }),
      resizeThreshold: component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize threshold',
          type: 'number',
          connect: this.layoutRx[slot].resizeThreshold,
        },
      }),
      resizeCollapseRatio: component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize collapsed threshold',
          type: 'number',
          connect: this.layoutRx[slot].resizeCollapseRatio,
        },
      }),
      resizePreviewDelay: component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize preview delay',
          type: 'number',
          connect: this.layoutRx[slot].resizePreviewDelay,
        },
      }),
    };
  }

  constructor(private layoutRx: LayoutRx) {}
}
