import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { EditorNavItem, EditorView } from './editor-model';

@Component({
  selector: 'berg-editor-nav',
  templateUrl: './editor-nav.component.html',
  styleUrls: ['./editor-nav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorNavComponent {
  view: EditorView = 'none';

  @Output() viewChanged = new EventEmitter<EditorView>();

  items: EditorNavItem[] = [
    {
      view: 'edit',
      icon: 'edit',
      description: 'Edit layout',
    },
    {
      view: 'code',
      icon: 'code',
      description: 'View code',
    },
  ];

  updateView(view: EditorView): void {
    if (view === this.view) {
      this.view = 'none';
    } else {
      this.view = view;
    }

    this.viewChanged.next(view);
  }
}
