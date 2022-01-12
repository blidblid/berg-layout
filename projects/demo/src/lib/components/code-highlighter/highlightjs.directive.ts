import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import * as hljs from 'highlight.js';

@Directive({
  selector: '[bergHighlightCode]',
})
export class BergHighlightCodeDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    hljs.default.highlightElement(this.elementRef.nativeElement);
  }
}
