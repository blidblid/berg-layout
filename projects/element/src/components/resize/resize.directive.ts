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
  BehaviorSubject,
  defer,
  fromEvent,
  merge,
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
import { BodyListeners } from '../../core';
import { BergLayoutController, BergLayoutSlot } from '../layout';
import {
  BergResizeInputs,
  BergResizePosition,
  BergResizeSize,
  BERG_RESIZE_DEFAULT_INPUTS,
  BERG_RESIZE_EXPAND_PADDING,
  BERG_RESIZE_INPUTS,
} from './resize-model';

@Directive({
  host: {
    '[class.berg-resize-resizing]': '_resizing',
    '[class.berg-resize-previewing]': '_previewing',
    '[class.berg-resize-collapsed]': '_resizeCollapsed',
    '[class.berg-resize-unresizable]': '!_resizable',
    '[style.width.px]': 'size?.width',
    '[style.height.px]': 'size?.height',
    '[style.box-sizing]': '"border-box"',
  },
})
export abstract class BergResizeBase implements OnInit, OnDestroy {
  /** Whether the popover is disabled. */
  @Input('bergResizePosition')
  get resizePosition() {
    return this._resizePosition ?? this._slotResizePosition;
  }
  set resizePosition(value: BergResizePosition) {
    this._resizePosition = value;
  }
  private _resizePosition: BergResizePosition = this.getInput('position');

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
    return this.slotSub.value;
  }
  set slot(value: BergLayoutSlot) {
    if (value === 'top') {
      this._slotResizePosition = 'below';
    } else if (value === 'right') {
      this._slotResizePosition = 'before';
    } else if (value === 'bottom') {
      this._slotResizePosition = 'above';
    } else if (value === 'left') {
      this._slotResizePosition = 'after';
    } else {
      this._slotResizePosition = null;
    }

    this._controller.addSlot(value);
    this.slotSub.next(value);
  }
  private slotSub = new BehaviorSubject<BergLayoutSlot>('center');
  private _slotResizePosition: BergResizePosition;

  _resizing = false;
  _previewing = false;
  _resizeCollapsed = false;
  _resizable = true;
  abstract _controller: BergLayoutController;

  size: BergResizeSize;

  /** Whether resizing is disabled. */
  @Input('bergResizeDisabled')
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = this.getInput('disabled');

  protected destroySub = new Subject<void>();

  protected get hostElem() {
    return this.elementRef.nativeElement;
  }

  private resizable$ = this.slotSub.pipe(
    switchMap((slot) => this._controller.getResizable(slot))
  );

  protected previewing$ = defer(() => {
    return this._controller.mousemove$.pipe(
      withLatestFrom(this.resizable$),
      filter(([_, resizable]) => !this._disabled && resizable),
      map(([event]) => this.checkThreshold(event)),
      distinctUntilChanged()
    );
  });

  protected startPreview$ = this.previewing$.pipe(
    filter((previewing) => previewing)
  );

  protected stopPreview$ = this.previewing$.pipe(
    filter((previewing) => !previewing)
  );

  protected startResize$ = this.startPreview$.pipe(
    withLatestFrom(this.resizable$),
    filter(([_, resizable]) => !this._disabled && resizable),
    switchMap(() => {
      return this._controller.mousedown$.pipe(takeUntil(this.stopPreview$));
    })
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
    switchMap(() =>
      this._controller.mousemove$.pipe(takeUntil(this.stopResize$))
    ),
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

  /** Emits when a user resizes beyond where the element stops shrinking. */
  @Output('bergResizeCollapsed') collapsed$ = merge(
    this.collapseAtSize$.pipe(map(() => true)),
    this.expandAtSize$.pipe(map(() => false))
  ).pipe(distinctUntilChanged());

  constructor(
    protected bodyListeners: BodyListeners,
    protected elementRef: ElementRef,
    protected viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(BERG_RESIZE_INPUTS)
    @Optional()
    protected inputs: BergResizeInputs
  ) {}

  private subscribeToEvents(): void {
    if (this.resizePosition === null) {
      return;
    }

    this.resizing$
      .pipe(takeUntil(this.destroySub))
      .subscribe((resizing) => (this._resizing = resizing));

    this.previewing$
      .pipe(
        switchMap((previewing) => {
          return of(previewing).pipe(delay(previewing ? this.previewDelay : 0));
        }),
        takeUntil(this.destroySub)
      )
      .subscribe((previewing) => (this._previewing = previewing));

    this.resizedSize$
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((size) => (this.size = size));

    merge(fromEvent<DragEvent>(this.hostElem, 'dragstart'))
      .pipe(takeUntil(this.destroySub))
      .subscribe((event) => event.preventDefault());

    this.collapsed$.pipe(takeUntil(this.destroySub)).subscribe((collapsed) => {
      this._resizeCollapsed = collapsed;
    });

    this.resizable$.pipe(takeUntil(this.destroySub)).subscribe((resizable) => {
      this._resizable = resizable;
    });
  }

  private calculateSize(event: MouseEvent): BergResizeSize {
    const rect = this.hostElem.getBoundingClientRect();

    if (this.resizePosition === 'above') {
      return { rect, height: rect.height + rect.y - event.pageY };
    }

    if (this.resizePosition === 'after') {
      return { rect, width: event.pageX - rect.x };
    }

    if (this.resizePosition === 'below') {
      return { rect, height: event.pageY - rect.y };
    }

    return { rect, width: rect.width + rect.x - event.pageX };
  }

  private checkThreshold(event: MouseEvent): boolean {
    if (!this.resizePosition) {
      return false;
    }

    let mouse = 0;
    let origin = 0;

    const { x, y, width, height } = this.hostElem.getBoundingClientRect();

    if (width === 0 || height === 0) {
      return false;
    }

    if (this.resizePosition === 'above') {
      mouse = event.pageY;
      origin = y;
    } else if (this.resizePosition === 'after') {
      mouse = event.pageX;
      origin = x + width;
    } else if (this.resizePosition === 'below') {
      mouse = event.pageY;
      origin = height + y;
    } else if (this.resizePosition === 'before') {
      mouse = event.pageX;
      origin = x;
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
    this._controller.removeSlot(this.slot);
  }

  ngOnInit(): void {
    this.subscribeToEvents();
  }
}
