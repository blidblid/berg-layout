import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { EditorIconNavBase } from './editor-nav-base';

@Component({
  selector: 'berg-editor-icon-nav',
  templateUrl: './editor-icon-nav.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorIconNavComponent extends EditorIconNavBase {}
