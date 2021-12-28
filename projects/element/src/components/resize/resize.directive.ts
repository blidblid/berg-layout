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
import {
  animationFrameScheduler,
  fromEvent,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  delay,
  distinctUntilChanged,
  filter,
  map,
  startWith,
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
  BERG_RESIZE_PREVIEW_DELAY,
} from './resize-model';

@Directive({
  selector: '[bergResize]',
  host: {
    '[class.berg-resize-resizing]': 'resizing',
    '[class.berg-resize-previewing]': 'previewing',
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

  protected get hostElem() {
    return this.elementRef.nativeElement;
  }

  protected previewing$ = this.getMousemove().pipe(
    filter(() => !this._disabled),
    map((event) => this.checkThreshold(event)),
    distinctUntilChanged()
  );

  protected startPreview = this.previewing$.pipe(
    filter((previewing) => previewing)
  );

  protected stopPreview$ = this.previewing$.pipe(
    filter((previewing) => !previewing)
  );

  protected startResize$ = this.startPreview.pipe(
    filter(() => !this._disabled),
    switchMap(() => this.getMousedown().pipe(takeUntil(this.stopPreview$))),
    map((event) => this.checkThreshold(event))
  );

  protected stopResize$ = merge(
    fromEvent<MouseEvent>(this.document.body, 'mouseup'),
    fromEvent<DragEvent>(this.document.body, 'dragend')
  ).pipe(map(() => false));

  protected resizing$ = merge(this.startResize$, this.stopResize$).pipe(
    startWith(false),
    distinctUntilChanged()
  );

  protected resizedSize$ = this.startResize$.pipe(
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

  protected getMousedown(): Observable<MouseEvent> {
    return fromEvent<MouseEvent>(this.hostElem, 'mousedown');
  }

  protected getMousemove(): Observable<MouseEvent> {
    return fromEvent<MouseEvent>(this.hostElem, 'mousemove');
  }

  private subscribeToEvents(): void {
    if (this.position === null) {
      return;
    }

    merge(this.startResize$, this.stopResize$)
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((resizing) => (this.resizing = resizing));

    this.previewing$
      .pipe(
        switchMap((previewing) => {
          return of(previewing).pipe(
            delay(previewing ? BERG_RESIZE_PREVIEW_DELAY : 0)
          );
        }),
        takeUntil(this.destroySub)
      )
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
    if (!this.position) {
      return false;
    }

    let mouse = 0;
    let origin = 0;

    const rect = this.hostElem.getBoundingClientRect();

    if (this.position === 'above') {
      mouse = event.pageY;
      origin = rect.y;
    } else if (this.position === 'after') {
      mouse = event.pageX;
      origin = rect.x + rect.width;
    } else if (this.position === 'below') {
      mouse = event.pageY;
      origin = rect.height + rect.y;
    } else if (this.position === 'before') {
      mouse = event.pageX;
      origin = rect.x;
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
    this.subscribeToEvents();
  }
}
