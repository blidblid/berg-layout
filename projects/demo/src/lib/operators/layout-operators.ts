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
      connectToFormValue: this.layoutRx.edit$,
    },
  });

  top = this.getPanelComponents('top');
  right = this.getPanelComponents('right');
  bottom = this.getPanelComponents('bottom');
  left = this.getPanelComponents('left');

  layout = [
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Style',
        connectToFormValue: this.layoutRx.layoutStyle$,
        data: [
          'Abyss',
          'Dark',
          'High Contrast',
          'Light',
          'Material Dark',
          'Material Light',
          'Quiet Light',
          'Solarized Dark',
          'Solarized Light',
        ],
      },
    }),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Top left position',
        pluckLabel: (value) => this.capitalize(value),
        connectToFormValue: this.layoutRx.layout.topLeftPosition,
        data: ['above', 'between'],
      },
    }),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Top right position',
        pluckLabel: (value) => this.capitalize(value),
        connectToFormValue: this.layoutRx.layout.topRightPosition,
        data: ['above', 'between'],
      },
    }),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Bottom left position',
        pluckLabel: (value) => this.capitalize(value),
        connectToFormValue: this.layoutRx.layout.bottomLeftPosition,
        data: ['below', 'between'],
      },
    }),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Bottom right position',
        pluckLabel: (value) => this.capitalize(value),
        connectToFormValue: this.layoutRx.layout.bottomRightPosition,
        data: ['below', 'between'],
      },
    }),
  ];

  resizing = [
    component({
      component: BergCheckboxComponent,
      inputs: {
        label: 'Resize disabled',
        connectToFormValue: this.layoutRx.layout.resizeDisabled,
      },
    }),
    component({
      component: BergCheckboxComponent,
      inputs: {
        label: 'Resize two dimensions',
        connectToFormValue: this.layoutRx.layout.resizeTwoDimensions,
      },
    }),
    component({
      component: BergInputComponent,
      inputs: {
        label: 'Resize preview delay',
        type: 'number',
        connectToFormValue: this.layoutRx.layout.resizePreviewDelay,
      },
    }),
  ];

  insets = [
    component({
      component: BergInputComponent,
      inputs: {
        type: 'number',
        label: 'Top inset',
        connectToFormValue: this.layoutRx.layout.topInset,
      },
    }),
    component({
      component: BergInputComponent,
      inputs: {
        type: 'number',
        label: 'Right inset',
        connectToFormValue: this.layoutRx.layout.rightInset,
      },
    }),
    component({
      component: BergInputComponent,
      inputs: {
        type: 'number',
        label: 'Bottom inset',
        connectToFormValue: this.layoutRx.layout.bottomInset,
      },
    }),
    component({
      component: BergInputComponent,
      inputs: {
        type: 'number',
        label: 'Left inset',
        connectToFormValue: this.layoutRx.layout.leftInset,
      },
    }),
  ];

  private getPanelComponents(slot: Slot) {
    return [
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Remove',
          connectToFormValue: this.layoutRx[slot].remove,
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Absolute',
          connectToFormValue: this.layoutRx[slot].absolute,
          disabled: this.layoutRx[slot].remove.asObservable(),
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Collapsed',
          connectToFormValue: this.layoutRx[slot].collapsed,
          disabled: this.layoutRx[slot].remove.asObservable(),
        },
      }),
      component({
        component: BergCheckboxComponent,
        inputs: {
          label: 'Resize disabled',
          connectToFormValue: this.layoutRx[slot].resizeDisabled,
          disabled: this.layoutRx[slot].remove.asObservable(),
        },
      }),
    ];
  }

  constructor(private layoutRx: LayoutRx) {}

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
