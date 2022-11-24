import { BreakpointObserver } from '@angular/cdk/layout';
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
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebComponentDemoComponent extends DemoBase {
  constructor(
    public operators: LayoutOperators,
    public override rx: LayoutRx,
    protected override breakpointObserver: BreakpointObserver
  ) {
    super(rx, breakpointObserver);
    require('@berg-layout/web-component');
  }
}
