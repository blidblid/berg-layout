import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { connectFormValue, LayoutRx } from '../../rx';

@Component({
  selector: 'app-editor-form',
  templateUrl: './editor-form.component.html',
  styleUrls: ['./editor-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-editor-form',
  },
})
export class EditorFormComponent {
  formControl = new FormControl<string>('top');

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
    contentMinSize: new FormControl(),
    overflow: new FormControl('none'),
  } as const;

  resizeFormControls = {
    resizeToggleSize: new FormControl(),
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
        this.layoutRx[slot].animationDisabled,
        this.panelFormControls[slot].animationDisabled
      );

      connectFormValue(
        this.layoutRx.remove[slot],
        this.panelFormControls[slot].remove
      );
    }

    connectFormValue(this.layoutRx.theme, this.layoutFormControls.theme);

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
      this.layoutRx.layout.overflow,
      this.layoutFormControls.overflow
    );

    connectFormValue(
      this.layoutRx.layout.contentMinSize,
      this.layoutFormControls.contentMinSize
    );

    connectFormValue(
      this.layoutRx.layout.resizeToggleSize,
      this.resizeFormControls.resizeToggleSize
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
      animationDisabled: new FormControl(),
    };
  }
}
