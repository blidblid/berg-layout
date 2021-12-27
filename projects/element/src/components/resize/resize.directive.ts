import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import { animationFrameScheduler, fromEvent, merge, Subject } from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { BergLayoutSlot } from '../layout/layout-model';
import {
  BergResizeInputs,
  BergResizePosition,
  BergResizeSize,
  BERG_RESIZE_DEFAULT_INPUTS,
  BERG_RESIZE_INPUTS,
} from './resize-model';

@Directive({
  selector: '[bergResize]',
  host: {
    '[class.berg-resize-resizing]': 'resizing',
    '[class.berg-resize-previewing]': 'previewing',
    '[class.berg-resize-above]': 'position === "above"',
    '[class.berg-resize-after]': 'position === "after"',
    '[class.berg-resize-below]': 'position === "below"',
    '[class.berg-resize-before]': 'position === "before"',
    '[style.width.px]': 'size.width',
    '[style.height.px]': 'size.height',
    '[style.box-sizing]': '"border-box"',
  },
})
export class BergResizeDirective implements OnInit, OnDestroy {
  /** Whether the popover is disabled. */
  @Input('bergResizePosition')
  get position() {
    return this._position ?? this._slotPosition;
  }
  set position(value: BergResizePosition) {
    this._position = value;
  }
  private _position: BergResizePosition = this.getInput('position');

  /** Threshold to determine if a cursor position should be able to resize the element. */
  @Input('bergResizeThreshold')
  get threshold() {
    return this._threshold;
  }
  set threshold(value: number) {
    this._threshold = value;
  }
  private _threshold: number = this.getInput('threshold');

  /** Slot name to position the resize toggle. */
  @Input('slot')
  get slot() {
    return this._slot;
  }
  set slot(value: BergLayoutSlot) {
    if (value === 'top') {
      this._slotPosition = 'below';
    } else if (value === 'right') {
      this._slotPosition = 'before';
    } else if (value === 'bottom') {
      this._slotPosition = 'above';
    } else if (value === 'left') {
      this._slotPosition = 'after';
    }

    this._slot = value;
  }
  private _slot: BergLayoutSlot;
  private _slotPosition: BergResizePosition;

  resizing = false;
  previewing = false;

  size: BergResizeSize = { width: undefined, height: undefined };

  /** Whether the popover is disabled. */
  @Input('bergResizeDisabled')
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = this.getInput('disabled');

  protected destroySub = new Subject<void>();

  private get hostElem() {
    return this.elementRef.nativeElement;
  }

  private startResize$ = fromEvent<MouseEvent>(this.hostElem, 'mousedown').pipe(
    filter(() => !this._disabled),
    map((event) => this.checkThreshold(event))
  );

  private stopResize$ = merge(
    fromEvent<MouseEvent>(this.document.body, 'mouseup'),
    fromEvent<MouseEvent>(this.document.body, 'dragend')
  ).pipe(map(() => false));

  private startPreviewing$ = fromEvent<MouseEvent>(
    this.hostElem,
    'mousemove'
  ).pipe(
    filter(() => !this._disabled),
    map((event) => this.checkThreshold(event))
  );

  private stopPreviewing$ = fromEvent<MouseEvent>(
    this.hostElem,
    'mouseleave'
  ).pipe(
    filter(() => !this._disabled),
    map(() => false)
  );

  private resizedSize$ = this.startResize$.pipe(
    switchMap(() => {
      return fromEvent<MouseEvent>(this.document.body, 'mousemove').pipe(
        takeUntil(this.stopResize$)
      );
    }),
    delay(0, animationFrameScheduler),
    map((event) => this.calculateSize(event))
  );

  constructor(
    protected elementRef: ElementRef<HTMLElement>,
    protected viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(BERG_RESIZE_INPUTS)
    @Optional()
    protected inputs: BergResizeInputs
  ) {}

  private subscribe(): void {
    if (this.position === null) {
      return;
    }

    merge(this.startResize$, this.stopResize$)
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((resizing) => (this.resizing = resizing));

    merge(this.startPreviewing$, this.stopPreviewing$)
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((previewing) => (this.previewing = previewing));

    this.resizedSize$
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((size) => (this.size = size));

    merge(fromEvent(this.hostElem, 'dragstart'))
      .pipe(takeUntil(this.destroySub))
      .subscribe((event) => event.preventDefault());
  }

  private calculateSize(event: MouseEvent): BergResizeSize {
    const rect = this.hostElem.getBoundingClientRect();

    if (this.position === 'above') {
      return { height: rect.height + rect.y - event.pageY };
    }

    if (this.position === 'after') {
      return { width: event.pageX - rect.x };
    }

    if (this.position === 'below') {
      return { height: event.pageY - rect.y };
    }

    return { width: rect.width + rect.x - event.pageX };
  }

  private checkThreshold(event: MouseEvent): boolean {
    let mouse = 0;
    let origin = 0;

    if (this.position === 'above') {
      mouse = event.offsetY;
      origin = 0;
    } else if (this.position === 'after') {
      mouse = event.offsetX;
      origin = this.hostElem.getBoundingClientRect().width;
    } else if (this.position === 'below') {
      mouse = event.offsetY;
      origin = this.hostElem.getBoundingClientRect().height;
    } else if (this.position === 'before') {
      mouse = event.offsetX;
      origin = 0;
    }

    return this.threshold > Math.abs(origin - mouse);
  }

  private getInput<T extends keyof BergResizeInputs>(
    input: T
  ): BergResizeInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_RESIZE_DEFAULT_INPUTS[input];
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }

  ngOnInit(): void {
    this.subscribe();
  }
}
