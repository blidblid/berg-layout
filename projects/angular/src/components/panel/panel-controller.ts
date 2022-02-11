import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
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

  resizeToggles = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  private addPanelSub = new Subject<BergPanelInputs>();
  private pushPanelSub = new Subject<void>();
  private removePanelSub = new Subject<BergPanelInputs>();

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

  protected getInput<T extends keyof BergLayoutInputs>(
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
