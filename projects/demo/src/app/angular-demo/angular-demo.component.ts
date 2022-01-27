import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BergPanelResizeSnap } from '@berg-layout/angular';
import { LayoutOperators } from '@demo/operators';
import { LayoutRx, Slot } from '@demo/rx';

@Component({
  selector: 'berg-angular-demo',
  templateUrl: './angular-demo.component.html',
  styleUrls: ['./angular-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularDemoComponent {
  constructor(public operators: LayoutOperators, public rx: LayoutRx) {}

  onBackdropClicked(slot: Slot): void {
    this.rx[slot].collapsed.next(true);
  }

  onResizeSnapped(slot: Slot, resizeSnap: BergPanelResizeSnap): void {
    this.rx[slot].resizeSnap.next(resizeSnap);
  }
}
