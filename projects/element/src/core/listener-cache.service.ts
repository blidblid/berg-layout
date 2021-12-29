import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListenerCacheService {
  bodyMouseup$ = fromEvent<MouseEvent>(this.document.body, 'mouseup');
  bodyDragend$ = fromEvent<DragEvent>(this.document.body, 'dragend');

  private mousemove = new WeakMap<HTMLElement, Observable<MouseEvent>>();
  private mousedown = new WeakMap<HTMLElement, Observable<MouseEvent>>();

  constructor(@Inject(DOCUMENT) protected document: Document) {}

  getMousemove(
    layoutElement: HTMLElement,
    getObservable: () => Observable<MouseEvent>
  ): Observable<MouseEvent> {
    return this.getCached(this.mousemove, layoutElement, getObservable);
  }

  getMousedown(
    layoutElement: HTMLElement,
    getObservable: () => Observable<MouseEvent>
  ): Observable<MouseEvent> {
    return this.getCached(this.mousedown, layoutElement, getObservable);
  }

  private getCached<T>(
    map: WeakMap<HTMLElement, Observable<T>>,
    layout: HTMLElement,
    getObservable: () => Observable<T>
  ): Observable<T> {
    const cached = map.get(layout);

    if (cached) {
      return cached;
    }

    const observable = getObservable();
    map.set(layout, observable);

    return observable;
  }
}
