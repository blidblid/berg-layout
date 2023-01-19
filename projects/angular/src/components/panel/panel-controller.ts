import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { ChangeDetectorRef, Directive, Input, OnDestroy } from '@angular/core';
import {
  debounceTime,
  fromEvent,
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
import { BergPanelComponentInputs, BergPanelSlot } from './panel-model';
import { BergPanelVariables } from './panel-model-private';
import { arrayReducer } from './panel-util';

@Directive({
  host: {
    '[class.berg-layout-top-absolute]': 'absolutePanels.top',
    '[class.berg-layout-right-absolute]': 'absolutePanels.right',
    '[class.berg-layout-bottom-absolute]': 'absolutePanels.bottom',
    '[class.berg-layout-left-absolute]': 'absolutePanels.left',
    '[class.berg-layout-top-collapsed]': 'collapsedPanels.top',
    '[class.berg-layout-right-collapsed]': 'collapsedPanels.right',
    '[class.berg-layout-bottom-collapsed]': 'collapsedPanels.bottom',
    '[class.berg-layout-left-collapsed]': 'collapsedPanels.left',
  },
})
export class BergPanelController implements OnDestroy {
  @Input()
  get resizeDisabled(): boolean {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean | null) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getDefaultInput('resizeDisabled');

  @Input()
  get resizePreviewDelay(): number {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number | null) {
    this._resizePreviewDelay = coerceNumberProperty(value);
  }
  private _resizePreviewDelay: number =
    this.getDefaultInput('resizePreviewDelay');

  @Input()
  get resizeTwoDimensions(): boolean {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean | null) {
    this._resizeTwoDimensions = coerceBooleanProperty(value);
  }
  private _resizeTwoDimensions: boolean = this.getDefaultInput(
    'resizeTwoDimensions'
  );

  @Input()
  get topLeftPosition() {
    return this._topLeftPosition;
  }
  set topLeftPosition(value: BergLayoutTopPosition | null) {
    this._topLeftPosition = value ?? this.getDefaultInput('topLeftPosition');
  }
  private _topLeftPosition: BergLayoutTopPosition =
    this.getDefaultInput('topLeftPosition');

  @Input()
  get topRightPosition() {
    return this._topRightPosition;
  }
  set topRightPosition(value: BergLayoutTopPosition | null) {
    this._topRightPosition = value ?? this.getDefaultInput('topRightPosition');
  }
  private _topRightPosition: BergLayoutTopPosition =
    this.getDefaultInput('topRightPosition');

  @Input()
  get bottomLeftPosition() {
    return this._bottomLeftPosition;
  }
  set bottomLeftPosition(value: BergLayoutBottomPosition | null) {
    this._bottomLeftPosition =
      value ?? this.getDefaultInput('bottomLeftPosition');
  }
  private _bottomLeftPosition: BergLayoutBottomPosition =
    this.getDefaultInput('bottomLeftPosition');

  @Input()
  get bottomRightPosition() {
    return this._bottomRightPosition;
  }
  set bottomRightPosition(value: BergLayoutBottomPosition | null) {
    this._bottomRightPosition =
      value ?? this.getDefaultInput('bottomRightPosition');
  }
  private _bottomRightPosition: BergLayoutBottomPosition = this.getDefaultInput(
    'bottomRightPosition'
  );

  /** @hidden */
  resizeToggles = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  collapsedPanels: BergPanelVariables<boolean> = {};
  absolutePanels: BergPanelVariables<boolean> = {};

  private addPanelSub = new Subject<BergPanelComponentInputs>();
  private pushPanelSub = new Subject<void>();
  private removePanelSub = new Subject<BergPanelComponentInputs>();

  private panels$ = arrayReducer({
    add: this.addPanelSub,
    push: this.pushPanelSub,
    remove: this.removePanelSub,
  }).pipe(debounceTime(0), shareReplay({ bufferSize: 1, refCount: true }));

  protected destroySub = new Subject<void>();

  constructor(
    public hostElem: HTMLElement,
    protected changeDetectorRef: ChangeDetectorRef,
    protected document: Document,
    protected inputs: BergLayoutInputs
  ) {
    this.subscribe();
    this.setInitialVariables();
  }

  /** @hidden */
  add(panel: BergPanelComponentInputs): void {
    this.addPanelSub.next(panel);
  }

  /** @hidden */
  push(): void {
    this.pushPanelSub.next();
  }

  /** @hidden */
  remove(panel: BergPanelComponentInputs): void {
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

  updateSize(slot: BergPanelSlot, size: number): void {
    this.hostElem.style.setProperty(`--berg-panel-${slot}-size`, `${size}px`);
  }

  updateAbsolute(slot: BergPanelSlot, absolute: boolean): void {
    this.absolutePanels[slot] = absolute;
    this.changeDetectorRef.markForCheck();
  }

  updateCollapsed(slot: BergPanelSlot, collapsed: boolean): void {
    this.collapsedPanels[slot] = collapsed;
    this.changeDetectorRef.markForCheck();
  }

  protected getDefaultInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
  }

  private setInitialVariables(): void {
    for (const slot of ['top', 'right', 'bottom', 'left'] as const) {
      this.updateSize(slot, 0);
    }
  }

  private subscribe(): void {
    this.panels$.subscribe(); // make shareReplay(1) eagerly cache panels
  }

  private getAdjacentResizeTogglesForSlot(slot: BergPanelSlot): HTMLElement[] {
    if (slot === 'top') {
      return [
        this.resizeToggles.top,
        this.resizeToggles.left,
        this.resizeToggles.right,
      ];
    }

    if (slot === 'right') {
      return [
        this.resizeToggles.right,
        this.resizeToggles.bottom,
        this.resizeToggles.top,
      ];
    }

    if (slot === 'bottom') {
      return [
        this.resizeToggles.bottom,
        this.resizeToggles.right,
        this.resizeToggles.left,
      ];
    }

    if (slot === 'left') {
      return [
        this.resizeToggles.left,
        this.resizeToggles.bottom,
        this.resizeToggles.top,
      ];
    }

    return [];
  }

  private createResizeToggleElement(slot: BergPanelSlot): HTMLElement {
    const div = this.document.createElement('div');
    div.classList.add(
      'berg-panel-resize-toggle',
      `berg-panel-resize-toggle-${slot}`
    );

    return div;
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
