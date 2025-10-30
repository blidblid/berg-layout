import { Component, ElementRef, inject, Input } from '@angular/core';
import * as hljs from 'highlight.js';

@Component({
  selector: 'app-highlight-code',
  templateUrl: './highlightjs.component.html',
  standalone: false,
})
export class BergHighlightCodeComponent {
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input()
  set code(code: string | null) {
    const highlightedCode = code
      ? hljs.default.highlightAuto(code, [
          'scss',
          'css',
          'html',
          'ts',
          'console',
        ]).value
      : '';

    this.elementRef.nativeElement.innerHTML = `<code>${highlightedCode}</code>`;
  }
}
