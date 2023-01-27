import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BergLayout, BergPanel } from '@berg-layout/core';
import { LayoutRx } from '../../lib/rx';
import { DemoBase } from '../demo-base';

customElements.define('berg-layout', BergLayout);
customElements.define('berg-panel', BergPanel);

@Component({
  selector: 'app-web-component-demo',
  templateUrl: './web-component-demo.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebComponentDemoComponent extends DemoBase {
  constructor(
    public override rx: LayoutRx,
    protected override breakpointObserver: BreakpointObserver
  ) {
    super(rx, breakpointObserver);
  }
}
