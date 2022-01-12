import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { LayoutOperators } from '@demo/operators';

@Component({
  selector: 'berg-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'berg-editor',
  },
})
export class EditorComponent {
  edit = false;

  constructor(public operators: LayoutOperators) {}
}
