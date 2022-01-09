import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'berg-web-component-demo',
  templateUrl: './web-component-demo.component.html',
  styleUrls: ['./web-component-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebComponentDemoComponent {
  collapsed = false;
  absolute = false;
}
