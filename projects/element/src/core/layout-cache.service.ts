import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListenerCacheService {
  private mousemove = new WeakMap<HTMLElement, Observable<MouseEvent>>();
  private mousedown = new WeakMap<HTMLElement, Observable<MouseEvent>>();

  getMousemove(
    layoutElement: HTMLElement,
    getFallback: () => Observable<MouseEvent>
  ): Observable<MouseEvent> {
    return this.getCached(this.mousemove, layoutElement, getFallback);
  }

  getMousedown(
    layoutElement: HTMLElement,
    getFallback: () => Observable<MouseEvent>
  ): Observable<MouseEvent> {
    return this.getCached(this.mousedown, layoutElement, getFallback);
  }

  private getCached<T>(
    map: WeakMap<HTMLElement, Observable<T>>,
    layout: HTMLElement,
    getFallback: () => Observable<T>
  ): Observable<T> {
    const observable = map.get(layout);

    if (observable) {
      return observable;
    }

    const fallback = getFallback();
    map.set(layout, fallback);

    return fallback;
  }
}
