import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { BergLayoutTopPosition } from 'dist/angular/components';
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
  BERG_LAYOUT_DEFAULT_INPUTS,
} from '../layout/layout-model';
import { BergPanelComponentInputs, BergPanelSlot } from './panel-model';
import { arrayReducer } from './panel-util';

@Directive()
export class BergPanelController {
  @Input()
  get resizeDisabled(): boolean {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean | null) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getDefaultInput('resizeDisabled');

  @Input()
  get resizeCollapseOffset(): number {
    return this._resizeCollapseOffset;
  }
  set resizeCollapseOffset(value: number | null) {
    this._resizeCollapseOffset = coerceNumberProperty(value);
  }
  private _resizeCollapseOffset: number = this.getDefaultInput(
    'resizeCollapseOffset'
  );

  @Input()
  get resizeExpandOffset(): number {
    return this._resizeExpandOffset;
  }
  set resizeExpandOffset(value: number | null) {
    this._resizeExpandOffset = coerceNumberProperty(value);
  }
  private _resizeExpandOffset: number =
    this.getDefaultInput('resizeExpandOffset');

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
  get topPosition() {
    return this._topPosition;
  }
  set topPosition(value: BergLayoutTopPosition | null) {
    this._topPosition = value ?? this.getDefaultInput('topPosition');
  }
  private _topPosition: BergLayoutTopPosition =
    this.getDefaultInput('topPosition');

  @Input()
  get bottomPosition() {
    return this._bottomPosition;
  }
  set bottomPosition(value: BergLayoutBottomPosition | null) {
    this._bottomPosition = value ?? this.getDefaultInput('bottomPosition');
  }
  private _bottomPosition: BergLayoutBottomPosition =
    this.getDefaultInput('bottomPosition');

  /** @hidden */
  resizeToggles = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  private addPanelSub = new Subject<BergPanelComponentInputs>();
  private pushPanelSub = new Subject<void>();
  private removePanelSub = new Subject<BergPanelComponentInputs>();

  private panels$ = arrayReducer({
    add: this.addPanelSub,
    push: this.pushPanelSub,
    remove: this.removePanelSub,
  }).pipe(debounceTime(0), shareReplay(1));

  constructor(
    public hostElem: HTMLElement,
    protected document: Document,
    protected inputs: BergLayoutInputs
  ) {
    this.panels$.subscribe(); // make shareReplay(1) eagerly cache panels
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

  protected getDefaultInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
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
}
