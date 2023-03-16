import { Component, ElementRef, Input } from '@angular/core';
import * as hljs from 'highlight.js';

@Component({
  selector: 'app-highlight-code',
  templateUrl: './highlightjs.component.html',
})
export class BergHighlightCodeComponent {
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

  constructor(private elementRef: ElementRef<HTMLElement>) {}
}
