import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import * as hljs from 'highlight.js';

@Directive({
  selector: 'pre > code',
})
export class BergHighlightCodeDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement.parentElement?.tagName === 'PRE') {
      hljs.default.highlightElement(this.elementRef.nativeElement);
    }
  }
}
