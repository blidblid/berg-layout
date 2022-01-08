import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BodyListeners {
  mouseup$ = fromEvent<MouseEvent>(this.document.body, 'mouseup');
  dragend$ = fromEvent<DragEvent>(this.document.body, 'dragend');
  mouseleave$ = fromEvent<MouseEvent>(this.document.body, 'mouseleave');

  constructor(@Inject(DOCUMENT) protected document: Document) {}
}
