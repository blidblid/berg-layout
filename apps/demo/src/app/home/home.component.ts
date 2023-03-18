import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Breakpoints } from '../../lib/components';
import {
  ANGULAR_FEATURE,
  Feature,
  FEATURES,
  REACT_FEATURE,
  WEB_COMPONENT_FEATURE,
} from '../config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-home',
  },
})
export class HomeComponent {
  features = FEATURES;

  title = '<berg-layout>';

  constructor(public breakpoints: Breakpoints) {}

  updateTitle(feature: Feature) {
    if (feature === REACT_FEATURE) {
      this.title = '<BergLayout/>';
    } else if (feature === ANGULAR_FEATURE) {
      this.title = '<berg-layout>';
    } else if (feature === WEB_COMPONENT_FEATURE) {
      this.title = '<berg-layout>';
    }
  }
}
