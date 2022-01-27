import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { LayoutOperators } from '@demo/operators';
import { LayoutRx, Slot } from '@demo/rx';

@Component({
  selector: 'berg-web-component-demo',
  templateUrl: './web-component-demo.component.html',
  styleUrls: ['./web-component-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebComponentDemoComponent {
  constructor(public operators: LayoutOperators, public rx: LayoutRx) {
    require('@berg-layout/web-component');
  }

  onBackdropClicked(slot: Slot): void {
    this.rx[slot].collapsed.next(true);
  }

  onResizeSnapped(slot: Slot, resizeSnap: any): void {
    this.rx[slot].resizeSnap.next(resizeSnap);
  }
}
