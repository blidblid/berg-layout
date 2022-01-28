import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { LayoutOperators } from '@demo/operators';
import { LayoutRx } from '@demo/rx';
import { DemoBase } from '../demo-base';

@Component({
  selector: 'berg-web-component-demo',
  templateUrl: './web-component-demo.component.html',
  styleUrls: ['./web-component-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebComponentDemoComponent extends DemoBase {
  constructor(public operators: LayoutOperators, public override rx: LayoutRx) {
    super(rx);
    require('@berg-layout/web-component');
  }
}
