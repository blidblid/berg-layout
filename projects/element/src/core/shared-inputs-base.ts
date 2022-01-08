import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input } from '@angular/core';
import { BergPanelControllerFactory } from '../components/panel/panel-controller-factory';
import {
  BergSharedInputs,
  BERG_SHARED_DEFAULT_INPUTS,
} from './shared-inputs-model';

@Directive()
export class BergCommonInputsBase implements BergSharedInputs {
  protected controller = this.controllerFactory.get(this.findLayoutElement());

  /** Whether the panel is absolutely positioned. */
  @Input()
  get absolute() {
    return this._absolute;
  }
  set absolute(value: boolean) {
    this._absolute = coerceBooleanProperty(value);
  }
  private _absolute: boolean = this.getCommonInput('absolute');

  /** Whether the panel is collapsed. */
  @Input()
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(value: boolean) {
    this._collapsed = coerceBooleanProperty(value);
  }
  private _collapsed: boolean = this.getCommonInput('collapsed');

  /** Threshold to determine if a cursor position should be able to resize the element. */
  @Input()
  get resizeThreshold() {
    return this._resizeThreshold;
  }
  set resizeThreshold(value: number) {
    this._resizeThreshold = value;
  }
  private _resizeThreshold: number = this.getCommonInput('resizeThreshold');

  /** Threshold to determine when a resize should be interpreted as a collapsing event. */
  @Input()
  get resizeCollapseThreshold() {
    return this._resizeCollapseThreshold;
  }
  set resizeCollapseThreshold(value: number) {
    this._resizeCollapseThreshold = value;
  }
  private _resizeCollapseThreshold: number = this.getCommonInput(
    'resizeCollapseThreshold'
  );

  /** Delay before the resize preview is shown. */
  @Input()
  get resizePreviewDelay() {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number) {
    this._resizePreviewDelay = value;
  }
  private _resizePreviewDelay: number =
    this.getCommonInput('resizePreviewDelay');

  /** Delay before the resize preview is shown. */
  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = value;
  }
  private _resizeTwoDimensions: boolean = this.getCommonInput(
    'resizeTwoDimensions'
  );

  /** Whether resizing is disabled. */
  @Input()
  get resizeDisabled() {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getCommonInput('resizeDisabled');

  protected layoutElement: HTMLElement;

  constructor(
    protected inputs: BergSharedInputs,
    protected controllerFactory: BergPanelControllerFactory,
    protected elementRef: ElementRef
  ) {}

  protected findLayoutElement(): HTMLElement {
    if (this.layoutElement) {
      return this.layoutElement;
    }

    let elem = this.elementRef.nativeElement;

    while (elem) {
      if (elem.tagName === 'BERG-LAYOUT') {
        return elem;
      }

      elem = elem.parentElement;
    }

    throw new Error('<berg-panel> could not find a <berg-layout> element');
  }

  private getCommonInput<T extends keyof BergSharedInputs>(
    input: T
  ): BergSharedInputs[T] {
    if (this.inputs) {
      return this.inputs[input];
    }

    if (this.controller.commonInputs && this.controller.commonInputs[input]) {
      return this.controller.commonInputs[input];
    }

    return BERG_SHARED_DEFAULT_INPUTS[input];
  }
}
