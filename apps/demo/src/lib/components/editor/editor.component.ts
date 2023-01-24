import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { connectFormValue, LayoutRx } from '../../rx';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'berg-editor',
  },
})
export class EditorComponent {
  @Input() css: string | null;
  @Input() html: string | null;
  @Input() scss: string | null;

  @Input()
  view: 'none' | 'edit' | 'code' = 'code';

  panelFormControls = {
    top: this.createPanelFormControls(),
    right: this.createPanelFormControls(),
    bottom: this.createPanelFormControls(),
    left: this.createPanelFormControls(),
  };

  layoutFormControls = {
    theme: new FormControl(),
    topLeftPosition: new FormControl(),
    topRightPosition: new FormControl(),
    bottomLeftPosition: new FormControl(),
    bottomRightPosition: new FormControl(),
  } as const;

  resizeFormControls = {
    resizeDisabled: new FormControl(),
    resizeTwoDimensions: new FormControl(),
    resizePreviewDelay: new FormControl(),
  } as const;

  insetFormControls = {
    top: new FormControl(),
    right: new FormControl(),
    bottom: new FormControl(),
    left: new FormControl(),
  };

  constructor(private layoutRx: LayoutRx) {
    this.connect();
  }

  private connect(): void {
    for (const slot of ['top', 'right', 'bottom', 'left'] as const) {
      connectFormValue(
        this.layoutRx[slot].absolute,
        this.panelFormControls[slot].absolute
      );

      connectFormValue(
        this.layoutRx[slot].collapsed,
        this.panelFormControls[slot].collapsed
      );

      connectFormValue(
        this.layoutRx[slot].resizeDisabled,
        this.panelFormControls[slot].resizeDisabled
      );

      connectFormValue(
        this.layoutRx[slot].remove,
        this.panelFormControls[slot].remove
      );
    }

    connectFormValue(this.layoutRx.layout.theme, this.layoutFormControls.theme);

    connectFormValue(
      this.layoutRx.layout.topLeftPosition,
      this.layoutFormControls.topLeftPosition
    );

    connectFormValue(
      this.layoutRx.layout.topRightPosition,
      this.layoutFormControls.topRightPosition
    );

    connectFormValue(
      this.layoutRx.layout.bottomLeftPosition,
      this.layoutFormControls.bottomLeftPosition
    );

    connectFormValue(
      this.layoutRx.layout.bottomRightPosition,
      this.layoutFormControls.bottomRightPosition
    );

    connectFormValue(
      this.layoutRx.layout.resizeDisabled,
      this.resizeFormControls.resizeDisabled
    );

    connectFormValue(
      this.layoutRx.layout.resizeTwoDimensions,
      this.resizeFormControls.resizeTwoDimensions
    );

    connectFormValue(
      this.layoutRx.layout.resizePreviewDelay,
      this.resizeFormControls.resizePreviewDelay
    );

    connectFormValue(this.layoutRx.layout.topInset, this.insetFormControls.top);

    connectFormValue(
      this.layoutRx.layout.rightInset,
      this.insetFormControls.right
    );

    connectFormValue(
      this.layoutRx.layout.bottomInset,
      this.insetFormControls.bottom
    );

    connectFormValue(
      this.layoutRx.layout.leftInset,
      this.insetFormControls.left
    );
  }

  private createPanelFormControls() {
    return {
      remove: new FormControl(),
      absolute: new FormControl(),
      collapsed: new FormControl(),
      resizeDisabled: new FormControl(),
    };
  }
}
