import { Component, ElementRef, Input } from '@angular/core';
import * as hljs from 'highlight.js';

@Component({
  selector: 'app-highlight-code',
  templateUrl: './highlightjs.component.html',
})
export class BergHighlightCodeComponent {
  @Input()
  set code(code: string | null) {
    this.elementRef.nativeElement.innerHTML = code
      ? hljs.default.highlightAuto(code, ['scss', 'css', 'html', 'ts']).value
      : '';
  }

  constructor(private elementRef: ElementRef<HTMLElement>) {}
}
