import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { Directive, Input, SimpleChanges } from '@angular/core';
import {
  debounceTime,
  fromEvent,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';
import {
  BergLayoutBottomPosition,
  BergLayoutInputs,
  BergLayoutTopPosition,
  BERG_LAYOUT_DEFAULT_INPUTS,
} from '../layout/layout-model';
import { BergPanelInputs, BergPanelSlot } from './panel-model';
import { arrayReducer } from './panel-util';

@Directive()
export class BergPanelController {
  @Input()
  get resizeDisabled() {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getInput('resizeDisabled');

  @Input()
  get resizeCollapseOffset() {
    return this._resizeCollapseOffset;
  }
  set resizeCollapseOffset(value: number) {
    this._resizeCollapseOffset = coerceNumberProperty(value);
  }
  private _resizeCollapseOffset: number = this.getInput('resizeCollapseOffset');

  @Input()
  get resizeExpandOffset() {
    return this._resizeExpandOffset;
  }
  set resizeExpandOffset(value: number) {
    this._resizeExpandOffset = coerceNumberProperty(value);
  }
  private _resizeExpandOffset: number = this.getInput('resizeExpandOffset');

  @Input()
  get resizePreviewDelay() {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number) {
    this._resizePreviewDelay = coerceNumberProperty(value);
  }
  private _resizePreviewDelay: number = this.getInput('resizePreviewDelay');

  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = coerceBooleanProperty(value);
  }
  private _resizeTwoDimensions: boolean = this.getInput('resizeTwoDimensions');

  @Input() topPosition: BergLayoutTopPosition = this.getInput('topPosition');

  @Input() bottomPosition: BergLayoutBottomPosition =
    this.getInput('bottomPosition');

  private addPanelSub = new Subject<BergPanelInputs>();
  private pushPanelSub = new Subject<void>();
  private removePanelSub = new Subject<BergPanelInputs>();

  private panels$ = arrayReducer({
    add: this.addPanelSub,
    push: this.pushPanelSub,
    remove: this.removePanelSub,
  }).pipe(debounceTime(0), shareReplay(1));

  private expandedPanels$ = this.panels$.pipe(
    map((panels) => panels.filter((panel) => !panel.collapsed))
  );

  private resizeTogglesRecord = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  constructor(
    public hostElem: HTMLElement,
    protected document: Document,
    protected inputs: BergLayoutInputs
  ) {
    this.panels$.subscribe(); // make shareReplay(1) eagerly cache panels
  }

  /** @hidden */
  add(panel: BergPanelInputs): void {
    this.addPanelSub.next(panel);
  }

  /** @hidden */
  push(): void {
    this.pushPanelSub.next();
  }

  /** @hidden */
  remove(panel: BergPanelInputs): void {
    this.removePanelSub.next(panel);
  }

  /** @hidden */
  fromLayoutEvent<T extends Event>(eventName: string): Observable<T> {
    return fromEvent<T>(this.hostElem, eventName);
  }

  /** @hidden */
  fromResizeTogglesEvent<T extends Event>(
    eventName: string,
    slot: BergPanelSlot
  ): Observable<T> {
    return merge(
      ...this.getAdjacentResizeTogglesForSlot(slot).map((resizeToggle) => {
        return fromEvent<T>(resizeToggle, eventName);
      })
    );
  }

  /** @hidden */
  getResizeToggle(slot: BergPanelSlot): HTMLElement | null {
    return slot === 'center' ? null : this.resizeTogglesRecord[slot];
  }

  /** @hidden */
  getRenderedResizeToggles(
    slot: BergPanelSlot
  ): Observable<HTMLElement | null> {
    return this.expandedPanels$.pipe(
      map((panels) => this.getResizeToggleForSlot(slot, panels))
    );
  }

  protected getInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
  }

  protected getResizeToggleForFlexContainer(): Observable<HTMLElement | null> {
    return this.expandedPanels$.pipe(
      map((panels) => {
        return this.isPositionedPanel('top', panels) &&
          this.topPosition === 'above'
          ? this.resizeTogglesRecord.top
          : null;
      })
    );
  }

  protected getResizeToggleForInnerFlexContainer(): Observable<HTMLElement | null> {
    return this.expandedPanels$.pipe(
      map((panels) => {
        return this.isPositionedPanel('left', panels)
          ? this.resizeTogglesRecord.left
          : null;
      })
    );
  }

  private getResizeToggleForSlot(
    slot: BergPanelSlot,
    panels: BergPanelInputs[]
  ): HTMLElement | null {
    if (!this.isRenderedPanel(slot, panels)) {
      return null;
    }

    if (slot === 'right') {
      return this.resizeTogglesRecord.right;
    }

    if (slot === 'bottom') {
      return this.resizeTogglesRecord.bottom;
    }

    if (slot === 'left' && isAbsolutePanel('left')) {
      return this.resizeTogglesRecord.left;
    }

    if (slot === 'top' && isAbsolutePanel('top')) {
      return this.resizeTogglesRecord.top;
    }

    if (slot === 'center') {
      if (
        this.isPositionedPanel('top', panels) &&
        this.topPosition === 'between'
      ) {
        return this.resizeTogglesRecord.top;
      }
    }

    return null;

    function isAbsolutePanel(slot: BergPanelSlot): boolean {
      return panels.some((panel) => panel.slot === slot && panel.absolute);
    }
  }

  private getAdjacentResizeTogglesForSlot(slot: BergPanelSlot): HTMLElement[] {
    if (slot === 'top') {
      return [
        this.resizeTogglesRecord.top,
        this.resizeTogglesRecord.left,
        this.resizeTogglesRecord.right,
      ];
    }

    if (slot === 'right') {
      return [
        this.resizeTogglesRecord.right,
        this.resizeTogglesRecord.bottom,
        this.resizeTogglesRecord.top,
      ];
    }

    if (slot === 'bottom') {
      return [
        this.resizeTogglesRecord.bottom,
        this.resizeTogglesRecord.right,
        this.resizeTogglesRecord.left,
      ];
    }

    if (slot === 'left') {
      return [
        this.resizeTogglesRecord.left,
        this.resizeTogglesRecord.bottom,
        this.resizeTogglesRecord.top,
      ];
    }

    return [];
  }

  private isPositionedPanel(
    slot: BergPanelSlot,
    panels: BergPanelInputs[]
  ): boolean {
    return panels.some((panel) => panel.slot === slot && !panel.absolute);
  }

  private isRenderedPanel(
    slot: BergPanelSlot,
    panels: BergPanelInputs[]
  ): boolean {
    return panels.some((panel) => panel.slot === slot && !panel.collapsed);
  }

  private createResizeToggleElement(slot: BergPanelSlot): HTMLElement {
    const div = this.document.createElement('div');
    const part = `resize-toggle-${slot}`;

    div.setAttribute('part', part);
    div.classList.add('berg-panel-resize-toggle', `berg-panel-${part}`);

    return div;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topPosition'] && !changes['topPosition'].isFirstChange()) {
      this.push();
    }
  }
}
