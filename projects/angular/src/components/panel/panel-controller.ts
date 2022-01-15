import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
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
import { BergPanel, BergPanelSlot } from './panel-model';

@Directive()
export class BergPanelController {
  /** Threshold to determine if a cursor position should be able to resize the element. */
  @Input()
  get resizeThreshold() {
    return this._resizeThreshold;
  }
  set resizeThreshold(value: number) {
    this._resizeThreshold = value;
  }
  private _resizeThreshold: number;

  /** Ratio to determine what resize event that should be interpreted as a collapsing event. */
  @Input()
  get resizeCollapseRatio() {
    return this._resizeCollapseRatio;
  }
  set resizeCollapseRatio(value: number) {
    this._resizeCollapseRatio = value;
  }
  private _resizeCollapseRatio: number;

  /** Delay before the resize preview is shown. */
  @Input()
  get resizePreviewDelay() {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number) {
    this._resizePreviewDelay = value;
  }
  private _resizePreviewDelay: number;

  /** Delay before the resize preview is shown. */
  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = coerceBooleanProperty(value);
  }
  private _resizeTwoDimensions: boolean;

  /** Whether resizing is disabled. */
  @Input()
  get resizeDisabled() {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean;

  private addPanelSub = new Subject<BergPanel>();
  private pushPanelSub = new Subject<void>();
  private removePanelSub = new Subject<BergPanel>();

  private panels$ = arrayReducer({
    add: this.addPanelSub,
    push: this.pushPanelSub,
    remove: this.removePanelSub,
  }).pipe(debounceTime(0), shareReplay(1));

  private resizeTogglesRecord = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  resizeToggles: HTMLElement[] = Object.values(this.resizeTogglesRecord);

  constructor(public hostElem: HTMLElement, protected document: Document) {
    this.panels$.subscribe(); // make shareReplay(1) eagerly cache panels
  }

  add(panel: BergPanel): void {
    this.addPanelSub.next(panel);
  }

  push(): void {
    this.pushPanelSub.next();
  }

  remove(panel: BergPanel): void {
    this.removePanelSub.next(panel);
  }

  fromLayoutEvent<T extends Event>(eventName: string): Observable<T> {
    return fromEvent<T>(this.hostElem, eventName);
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

    if (slot === 'left' && isAbsolutePanel('left')) {
      return [this.resizeTogglesRecord.left];
    }

    if (slot === 'top' && isAbsolutePanel('top')) {
      return [this.resizeTogglesRecord.top];
    }

    if (slot === 'center') {
      return (['left', 'top'] as const)
        .filter((s) => isPositionedPanel(s))
        .map((s) => this.resizeTogglesRecord[s]);
    }

    return [];

    function isAbsolutePanel(slot: BergPanelSlot): boolean {
      return panels.some((panel) => panel.slot === slot && panel.absolute);
    }

    function isPositionedPanel(slot: BergPanelSlot): boolean {
      return panels.some((panel) => panel.slot === slot && !panel.absolute);
    }
  }

  private createResizeToggleElement(slot: BergPanelSlot): HTMLElement {
    const div = this.document.createElement('div');
    div.classList.add(
      'berg-panel-resize-toggle',
      `berg-panel-resize-toggle-${slot}`
    );
    return div;
  }
}
