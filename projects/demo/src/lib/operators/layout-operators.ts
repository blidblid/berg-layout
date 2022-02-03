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

  layout = this.createLayout();
  top = this.createPanel('top');
  right = this.createPanel('right');
  bottom = this.createPanel('bottom');
  left = [
    ...this.createPanel('left'),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Snap',
        connect: this.layoutRx.left.snap,
        data: ['none', 'collapsed', 'expanded'],
        pluckLabel: (value) => value.charAt(0).toUpperCase() + value.slice(1),
        disabled: this.layoutRx.left.remove.asObservable(),
      },
    }),
  ];

  private createPanel(slot: Slot) {
    return [
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
          label: 'Absolute',
          connect: this.layoutRx[slot].absolute,
          disabled: this.layoutRx[slot].remove.asObservable(),
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Collapsed',
          connect: this.layoutRx[slot].collapsed,
          disabled: this.layoutRx[slot].remove.asObservable(),
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize disabled',
          connect: this.layoutRx[slot].resizeDisabled,
          disabled: this.layoutRx[slot].remove.asObservable(),
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
          label: 'Resize collapse offset',
          type: 'number',
          connect: this.layoutRx.layout.resizeCollapseOffset,
        },
      }),
      component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize expand offset',
          type: 'number',
          connect: this.layoutRx.layout.resizeExpandOffset,
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
      component({
        component: BergSelectComponent,
        inputs: {
          label: 'Style',
          connect: this.layoutRx.layoutStyle$,
          data: ['Dark Shades', 'Light Shades'],
        },
      }),
    ];
  }

  constructor(private layoutRx: LayoutRx) {}
}
