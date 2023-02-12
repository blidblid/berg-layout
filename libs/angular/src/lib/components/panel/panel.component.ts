import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BergPanelEventBindingMode, BergPanelSlot } from '@berg-layout/core';
import {
  BergPanelInputs,
  BergPanelOutputs,
  BergPanelResizeEvent,
  BERG_PANEL_DEFAULT_INPUTS,
  BERG_PANEL_INPUTS,
} from './panel-model';
import { BergPanelNullableInputs } from './panel-model-private';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BergPanelComponent
  implements BergPanelNullableInputs, BergPanelOutputs
{
  @Input()
  get slot(): BergPanelSlot {
    return this._slot;
  }
  set slot(value: BergPanelSlot | null) {
    this._slot = value ?? this.getDefaultInput('slot');
  }
  private _slot = this.getDefaultInput('slot');

  @Input()
  get absolute(): boolean {
    return this._absolute;
  }
  set absolute(value: boolean | null) {
    this._absolute = coerceBooleanProperty(
      value ?? this.getDefaultInput('absolute')
    );
  }
  private _absolute: boolean = this.getDefaultInput('absolute');

  @Input()
  get collapsed(): boolean {
    return this._collapsed;
  }
  set collapsed(value: boolean | null) {
    this._collapsed = coerceBooleanProperty(
      value ?? this.getDefaultInput('collapsed')
    );
  }
  private _collapsed: boolean = this.getDefaultInput('collapsed');

  @Input()
  get resizeDisabled(): boolean {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean | null) {
    this._resizeDisabled = coerceBooleanProperty(
      value ?? this.getDefaultInput('resizeDisabled')
    );
  }
  private _resizeDisabled = this.getDefaultInput('resizeDisabled');

  @Input()
  get size(): number {
    return this._size;
  }
  set size(value: number | null | undefined) {
    this._size = coerceNumberProperty(value) ?? this.getDefaultInput('size');
  }
  private _size: number = this.getDefaultInput('size');

  @Input()
  get minSize(): number | null {
    return this._minSize;
  }
  set minSize(value: number | null | undefined) {
    this._minSize =
      coerceNumberProperty(value) ?? this.getDefaultInput('minSize');
  }
  private _minSize: number | null = this.getDefaultInput('minSize');

  @Input()
  get maxSize(): number | null {
    return this._maxSize;
  }
  set maxSize(value: number | null | undefined) {
    this._maxSize =
      coerceNumberProperty(value) ?? this.getDefaultInput('maxSize');
  }
  private _maxSize: number | null = this.getDefaultInput('maxSize');

  @Input()
  get eventBindingMode() {
    return this._eventBindingMode;
  }
  set eventBindingMode(value: BergPanelEventBindingMode | null) {
    this._eventBindingMode = value ?? this.getDefaultInput('eventBindingMode');
  }
  private _eventBindingMode = this.getDefaultInput('eventBindingMode');

  @Output() resized = new EventEmitter<BergPanelResizeEvent>();
  @Output() backdropClicked = new EventEmitter<MouseEvent>();

  constructor(
    @Inject(BERG_PANEL_INPUTS)
    @Optional()
    protected inputs: BergPanelInputs
  ) {}

  onBackdropClicked(event: Event): void {
    if (event instanceof CustomEvent) {
      this.backdropClicked.emit(event.detail);
    }
  }

  onResized(event: Event): void {
    if (event instanceof CustomEvent) {
      this.resized.emit(event.detail);
    }
  }

  private getDefaultInput<T extends keyof BergPanelInputs>(
    input: T
  ): BergPanelInputs[T] {
    if (this.inputs) {
      return this.inputs[input];
    }

    return BERG_PANEL_DEFAULT_INPUTS[input];
  }
}
