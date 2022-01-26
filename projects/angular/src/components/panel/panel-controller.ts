import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import {
  debounceTime,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';
import { BergLayoutInputs, BERG_LAYOUT_DEFAULT_INPUTS } from '../layout';
import { BergPanel, BergPanelSlot } from './panel-model';
import { arrayReducer } from './panel-util';

@Directive()
export class BergPanelController {
  /**
   * Px value to determine what resize events should collapse panels.
   * If it's 16px, resizing will collapse a panel if its resized 16px smaller than it current width.
   */
  @Input()
  get resizeCollapseOffset() {
    return this._resizeCollapseOffset;
  }
  set resizeCollapseOffset(value: number) {
    this._resizeCollapseOffset = coerceNumberProperty(value);
  }
  private _resizeCollapseOffset: number = this.getInput('resizeCollapseOffset');

  /**
   * Px value to determine what resize events should expand panels.
   * If it's 16px, resizing will expand a panel if its resized 16px beyond than it current width.
   */
  @Input()
  get resizeExpandOffset() {
    return this._resizeExpandOffset;
  }
  set resizeExpandOffset(value: number) {
    this._resizeExpandOffset = coerceNumberProperty(value);
  }
  private _resizeExpandOffset: number = this.getInput('resizeExpandOffset');

  /** Delay before the resize preview is shown. */
  @Input()
  get resizePreviewDelay() {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number) {
    this._resizePreviewDelay = coerceNumberProperty(value);
  }
  private _resizePreviewDelay: number = this.getInput('resizePreviewDelay');

  /** Delay before the resize preview is shown. */
  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = coerceBooleanProperty(value);
  }
  private _resizeTwoDimensions: boolean = this.getInput('resizeTwoDimensions');

  /** Whether resizing is disabled. */
  @Input()
  get resizeDisabled() {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getInput('resizeDisabled');

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

  constructor(
    public hostElem: HTMLElement,
    protected document: Document,
    protected inputs: BergLayoutInputs
  ) {
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

  protected getInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
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
