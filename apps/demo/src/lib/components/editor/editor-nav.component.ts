import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { EditorIconNavBase } from './editor-nav-base';

@Component({
  selector: 'app-editor-nav',
  templateUrl: './editor-nav.component.html',
  styleUrls: ['./editor-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditorNavComponent extends EditorIconNavBase {}
