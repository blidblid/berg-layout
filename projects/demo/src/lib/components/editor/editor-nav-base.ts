import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { EditorNavItem, EditorView } from './editor-model';

@Directive()
export class EditorIconNavBase {
  @Input() view: EditorView = 'none';
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

    this.viewChanged.next(this.view);
  }
}
