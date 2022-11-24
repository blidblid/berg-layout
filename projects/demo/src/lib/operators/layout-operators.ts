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

  layout = this.getLayoutComponents();
  resizing = this.getResizingComponents();
  top = this.getPanelComponents('top');
  right = this.getPanelComponents('right');
  bottom = this.getPanelComponents('bottom');
  left = [
    ...this.getPanelComponents('left'),
    component({
      component: BergSelectComponent,
      inputs: {
        label: 'Snap',
        connectToFormValue: this.layoutRx.left.snap,
        data: ['none', 'collapsed', 'expanded'],
        pluckLabel: (value) => value.charAt(0).toUpperCase() + value.slice(1),
        disabled: this.layoutRx.left.remove.asObservable(),
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

  private getResizingComponents() {
    return [
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
          label: 'Resize collapse offset',
          type: 'number',
          connectToFormValue: this.layoutRx.layout.resizeCollapseOffset,
        },
      }),
      component({
        component: BergInputComponent,
        inputs: {
          label: 'Resize expand offset',
          type: 'number',
          connectToFormValue: this.layoutRx.layout.resizeExpandOffset,
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
  }

  private getLayoutComponents() {
    return [
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
  }

  constructor(private layoutRx: LayoutRx) {}

  private capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
