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
  Output,
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
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  share,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { BergLayoutSlot } from '../layout/layout-model';
import { BodyListeners } from './body-listeners';
import {
  BergResizeInputs,
  BergResizePosition,
  BergResizeSize,
  BERG_RESIZE_DEFAULT_INPUTS,
  BERG_RESIZE_EXPAND_PADDING,
  BERG_RESIZE_INPUTS,
} from './resize-model';

@Directive({
  selector: '[bergResize]',
  host: {
    '[class.berg-resize-resizing]': 'resizing',
    '[class.berg-resize-previewing]': 'previewing',
    '[class.berg-resize-collapsed]': 'collapsed',
    '[style.width.px]': 'size?.width',
    '[style.height.px]': 'size?.height',
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
  get resizeThreshold() {
    return this._resizeThreshold;
  }
  set resizeThreshold(value: number) {
    this._resizeThreshold = value;
  }
  private _resizeThreshold: number = this.getInput('resizeThreshold');

  /** Threshold to determine when a resize should be interpreted as a collapsing event. */
  @Input('bergResizeCollapseThreshold')
  get collapseThreshold() {
    return this._collapseThreshold;
  }
  set collapseThreshold(value: number) {
    this._collapseThreshold = value;
  }
  private _collapseThreshold: number = this.getInput('collapseThreshold');

  /** Delay before the resize preview is shown. */
  @Input('bergResizePreviewDelay')
  get previewDelay() {
    return this._previewDelay;
  }
  set previewDelay(value: number) {
    this._previewDelay = value;
  }
  private _previewDelay: number = this.getInput('previewDelay');

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
  collapsed = false;

  size: BergResizeSize;

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

  protected startPreview$ = this.previewing$.pipe(
    filter((previewing) => previewing)
  );

  protected stopPreview$ = this.previewing$.pipe(
    filter((previewing) => !previewing)
  );

  protected startResize$ = this.startPreview$.pipe(
    filter(() => !this._disabled),
    switchMap(() => this.getMousedown().pipe(takeUntil(this.stopPreview$)))
  );

  protected stopResize$ = merge(
    this.bodyListeners.mouseup$,
    this.bodyListeners.mouseleave$,
    this.bodyListeners.dragend$
  );

  protected resizing$ = merge(
    this.startResize$.pipe(map(() => true)),
    this.stopResize$.pipe(map(() => false))
  ).pipe(startWith(false), distinctUntilChanged());

  protected resizedSize$ = this.startResize$.pipe(
    switchMap(() => this.getMousemove().pipe(takeUntil(this.stopResize$))),
    debounceTime(0, animationFrameScheduler),
    map((event) => this.calculateSize(event)),
    share()
  );

  private collapseAtSize$ = this.resizedSize$.pipe(
    filter((size) => {
      if (size.width !== undefined) {
        return this.collapseThreshold >= size.width / size.rect.width;
      }

      if (size.height !== undefined) {
        return this.collapseThreshold >= size.height / size.rect.height;
      }

      return false;
    })
  );

  private expandAtSize$ = this.resizedSize$.pipe(
    withLatestFrom(this.collapseAtSize$),
    filter(([size, collapseAtSize]) => {
      if (size.width !== undefined && collapseAtSize.width !== undefined) {
        return size.width - BERG_RESIZE_EXPAND_PADDING > collapseAtSize.width;
      }

      if (size.height !== undefined && collapseAtSize.height !== undefined) {
        return size.height - BERG_RESIZE_EXPAND_PADDING > collapseAtSize.height;
      }

      return false;
    })
  );

  /** When a user resizes beyond a panel min-size. */
  @Output('bergResizeCollapsed') collapsed$ = merge(
    this.collapseAtSize$.pipe(map(() => true)),
    this.expandAtSize$.pipe(map(() => false))
  ).pipe(distinctUntilChanged());

  constructor(
    protected bodyListeners: BodyListeners,
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
    return fromEvent<MouseEvent>(this.document.body, 'mousemove');
  }

  private subscribeToEvents(): void {
    if (this.position === null) {
      return;
    }

    this.resizing$
      .pipe(takeUntil(this.destroySub))
      .subscribe((resizing) => (this.resizing = resizing));

    this.previewing$
      .pipe(
        switchMap((previewing) => {
          return of(previewing).pipe(delay(previewing ? this.previewDelay : 0));
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

    this.collapsed$.pipe(takeUntil(this.destroySub)).subscribe((collapsed) => {
      this.collapsed = collapsed;
    });
  }

  private calculateSize(event: MouseEvent): BergResizeSize {
    const rect = this.hostElem.getBoundingClientRect();

    if (this.position === 'above') {
      return { rect, height: rect.height + rect.y - event.pageY };
    }

    if (this.position === 'after') {
      return { rect, width: event.pageX - rect.x };
    }

    if (this.position === 'below') {
      return { rect, height: event.pageY - rect.y };
    }

    return { rect, width: rect.width + rect.x - event.pageX };
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

    return this.resizeThreshold > Math.abs(origin - mouse);
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
