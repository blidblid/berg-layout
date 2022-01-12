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
    this._resizeTwoDimensions = value;
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

    const queried: HTMLElement | null = document.querySelector('berg-layout');

    if (queried) {
      return queried;
    }

    throw new Error('<berg-panel> could not find a <berg-layout> element');
  }

  private getCommonInput<T extends keyof BergSharedInputs>(
    input: T
  ): BergSharedInputs[T] {
    if (
      this.controller.commonInputs &&
      this.controller.commonInputs[input] !== undefined
    ) {
      return this.controller.commonInputs[input];
    }

    if (this.inputs) {
      return this.inputs[input];
    }

    return BERG_SHARED_DEFAULT_INPUTS[input];
  }

  ngOnInit(): void {
    this._resizeDisabled = this.getCommonInput('resizeDisabled');
    this._resizePreviewDelay = this.getCommonInput('resizePreviewDelay');
    this._resizeThreshold = this.getCommonInput('resizeThreshold');
    this._resizeTwoDimensions = this.getCommonInput('resizeTwoDimensions');
    this._resizeCollapseRatio = this.getCommonInput('resizeCollapseRatio');
  }
}
