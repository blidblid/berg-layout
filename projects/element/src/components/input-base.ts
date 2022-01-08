import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Input } from '@angular/core';
import { BergCommonInputs, BERG_COMMON_DEFAULT_INPUTS } from './input-model';

@Directive()
export class BergCommonInputsBase {
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

  constructor(protected inputs: BergCommonInputs) {}

  private getCommonInput<T extends keyof BergCommonInputs>(
    input: T
  ): BergCommonInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_COMMON_DEFAULT_INPUTS[input];
  }
}
