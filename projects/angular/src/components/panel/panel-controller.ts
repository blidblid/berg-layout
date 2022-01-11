import { arrayReducer } from '@berglund/rx';
import {
  debounceTime,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';
import { BergSharedInputs } from '../../core';
import { BergPanel, BergPanelSlot } from './panel-model';

export class BergPanelController {
  private addSub = new Subject<BergPanel>();
  private pushSub = new Subject<void>();
  private removeSub = new Subject<BergPanel>();

  private panels$ = arrayReducer({
    add: this.addSub,
    push: this.pushSub,
    remove: this.removeSub,
  }).pipe(debounceTime(0), shareReplay(1));

  private resizeTogglesRecord = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  commonInputs: BergSharedInputs | null;
  resizeToggles: HTMLElement[] = Object.values(this.resizeTogglesRecord);

  constructor(public layoutElement: HTMLElement, private document: Document) {
    this.panels$.subscribe(); // make shareReplay(1) eagerly cache panels
  }

  add(panel: BergPanel): void {
    this.addSub.next(panel);
  }

  push(): void {
    this.pushSub.next();
  }

  remove(panel: BergPanel): void {
    this.removeSub.next(panel);
  }

  fromLayoutEvent<T extends Event>(eventName: string): Observable<T> {
    return fromEvent<T>(this.layoutElement, eventName);
  }

  fromResizeTogglesEvent<T extends Event>(eventName: string): Observable<T> {
    return merge(
      ...this.resizeToggles.map((resizeToggle) => {
        return fromEvent<T>(resizeToggle, eventName);
      })
    );
  }

  getResizeToggle(slot: BergPanelSlot): HTMLElement | null {
    return slot === 'center' ? null : this.resizeTogglesRecord[slot];
  }

  getRenderedResizeToggles(slot: BergPanelSlot): Observable<HTMLElement[]> {
    return this.panels$.pipe(
      map((panels) => this.getResizeTogglesForSlot(slot, panels))
    );
  }

  private getResizeTogglesForSlot(
    slot: BergPanelSlot,
    panels: BergPanel[]
  ): HTMLElement[] {
    if (slot === 'right') {
      return [this.resizeTogglesRecord.right];
    }

    if (slot === 'bottom') {
      return [this.resizeTogglesRecord.bottom];
    }

    if (
      slot === 'left' &&
      panels.some((panel) => panel.slot === 'left' && panel.absolute)
    ) {
      return [this.resizeTogglesRecord.left];
    }

    if (
      slot === 'top' &&
      panels.some((panel) => panel.slot === 'top' && panel.absolute)
    ) {
      return [this.resizeTogglesRecord.top];
    }

    if (slot === 'center') {
      return (['left', 'top'] as const)
        .filter((s) => {
          return panels.some((panel) => panel.slot === s && !panel.absolute);
        })
        .map((s) => this.resizeTogglesRecord[s]);
    }

    return [];
  }

  private createResizeToggleElement(slot: BergPanelSlot): HTMLElement {
    const div = this.document.createElement('div');
    div.classList.add('berg-resize-toggle', `berg-resize-toggle-${slot}`);
    return div;
  }
}
