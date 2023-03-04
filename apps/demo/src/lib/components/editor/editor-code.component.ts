import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-editor-code',
  templateUrl: './editor-code.component.html',
  styleUrls: ['./editor-code.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-editor-code',
  },
})
export class EditorCodeComponent {
  @Input() installCommand: string | null;
  @Input() importDeclaration: string | null;
  @Input() css: string | null;
  @Input() html: string | null;
  @Input() scss: string | null;
}
