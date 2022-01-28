import { Directive } from '@angular/core';
import { EditorView } from '@demo/components';
import { LayoutRx, Slot } from '@demo/rx';

@Directive()
export class DemoBase {
  view: EditorView = 'none';

  constructor(protected rx: LayoutRx) {}

  onBackdropClicked(slot: Slot): void {
    this.rx[slot].collapsed.next(true);
  }

  onResizeSnapped(slot: Slot, resizeSnap: any): void {
    this.rx[slot].resizeSnap.next(
      resizeSnap instanceof CustomEvent ? resizeSnap.detail : resizeSnap
    );
  }
}
