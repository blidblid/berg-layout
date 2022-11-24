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
  selector: 'berg-angular-demo',
  templateUrl: './angular-demo.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularDemoComponent extends DemoBase {
  constructor(
    public operators: LayoutOperators,
    public override rx: LayoutRx,
    protected override breakpointObserver: BreakpointObserver
  ) {
    super(rx, breakpointObserver);
  }
}
