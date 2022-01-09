import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'berg-angular-demo',
  templateUrl: './angular-demo.component.html',
  styleUrls: ['./angular-demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AngularDemoComponent {}
