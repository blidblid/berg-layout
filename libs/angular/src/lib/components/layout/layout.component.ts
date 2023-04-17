import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  BergLayoutBottomPosition,
  BergLayoutOverflow,
  BergLayoutTopPosition,
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@berg-layout/core';
import {
  BergLayoutInputs,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_LAYOUT_INPUTS,
} from './layout-model';
import { BergLayoutComponentInputs } from './layout-model-private';

@Component({
  selector: 'berg-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BergLayoutComponent implements BergLayoutComponentInputs {
  @Input()
  get resizeDisabled(): boolean {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean | null) {
    this._resizeDisabled = coerceBooleanProperty(
      value ?? this.getDefaultInput('resizeDisabled')
    );
  }
  private _resizeDisabled: boolean = this.getDefaultInput('resizeDisabled');

  @Input()
  get resizePreviewDelay(): number {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number | null) {
    this._resizePreviewDelay = coerceNumberProperty(
      value ?? this.getDefaultInput('resizePreviewDelay')
    );
  }
  private _resizePreviewDelay: number =
    this.getDefaultInput('resizePreviewDelay');

  @Input()
  get resizeTwoDimensions(): boolean {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean | null) {
    this._resizeTwoDimensions = coerceBooleanProperty(
      value ?? this.getDefaultInput('resizeTwoDimensions')
    );
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

  @Input()
  get topInset(): number {
    return this._topInset;
  }
  set topInset(value: number | null | undefined) {
    this._topInset = coerceNumberProperty(
      value ?? this.getDefaultInput('topInset')
    );
  }
  private _topInset: number = this.getDefaultInput('topInset');

  @Input()
  get rightInset(): number {
    return this._rightInset;
  }
  set rightInset(value: number | null | undefined) {
    this._rightInset = coerceNumberProperty(
      value ?? this.getDefaultInput('rightInset')
    );
  }
  private _rightInset: number = this.getDefaultInput('rightInset');

  @Input()
  get bottomInset(): number {
    return this._bottomInset;
  }
  set bottomInset(value: number | null | undefined) {
    this._bottomInset = coerceNumberProperty(
      value ?? this.getDefaultInput('bottomInset')
    );
  }
  private _bottomInset: number = this.getDefaultInput('bottomInset');

  @Input()
  get leftInset(): number {
    return this._leftInset;
  }
  set leftInset(value: number | null | undefined) {
    this._leftInset = coerceNumberProperty(
      value ?? this.getDefaultInput('leftInset')
    );
  }
  private _leftInset: number = this.getDefaultInput('leftInset');

  @Input()
  get overflow(): BergLayoutOverflow {
    return this._overflow;
  }
  set overflow(value: BergLayoutOverflow | null | undefined) {
    this._overflow = value ?? this.getDefaultInput('overflow');
  }
  private _overflow: BergLayoutOverflow = this.getDefaultInput('overflow');

  constructor(
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected inputs: BergLayoutInputs
  ) {}

  protected getDefaultInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
  }
}
