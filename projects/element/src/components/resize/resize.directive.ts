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
  combineLatest,
  defer,
  EMPTY,
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
import { BergPanelSlot } from '../panel';
import { BergPanelController } from '../panel/panel-controller';
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
  set slot(value: BergPanelSlot) {
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

    this._controller.push();
    this.slotSub.next(value);
  }
  private slotSub = new BehaviorSubject<BergPanelSlot>('center');
  private _slotResizePosition: BergResizePosition;

  _resizing = false;
  _previewing = false;
  _resizeCollapsed = false;
  abstract _controller: BergPanelController;

  size: BergResizeSize;

  /** Whether resizing is disabled. */
  @Input('bergResizeDisabled')
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean = this.getInput('disabled');

  protected destroySub = new Subject<void>();

  get hostElem() {
    return this.elementRef.nativeElement;
  }

  private resizable$ = defer(() => {
    return combineLatest([
      this.slotSub,
      this._controller.slotIsResizable$,
    ]).pipe(
      map(([slot, slotIsResizable]) => slotIsResizable(slot)),
      share()
    );
  });

  protected previewing$ = defer(() => {
    return this._controller.fromPanelsEvent<MouseEvent>('mousemove').pipe(
      withLatestFrom(this.resizable$),
      filter(([_, resizable]) => !this._disabled && resizable),
      map(([event]) => this.checkThreshold(event)),
      distinctUntilChanged(),
      share()
    );
  });

  protected resizeEvent$ = this.previewing$.pipe(
    withLatestFrom(this.resizable$),
    filter(([_, resizable]) => !this._disabled && resizable),
    switchMap(([previewing]) => {
      return previewing
        ? this._controller.fromLayoutEvent<MouseEvent>('mousedown')
        : EMPTY;
    })
  );

  protected stopResizeEvent$ = merge(
    this.bodyListeners.mouseup$,
    this.bodyListeners.mouseleave$,
    this.bodyListeners.dragend$
  );

  protected resizing$ = merge(
    this.resizeEvent$.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(startWith(false), distinctUntilChanged());

  protected resizedSize$ = this.resizeEvent$.pipe(
    switchMap(() =>
      this._controller
        .fromLayoutEvent<MouseEvent>('mousemove')
        .pipe(takeUntil(this.stopResizeEvent$))
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
  }

  ngOnInit(): void {
    this.subscribeToEvents();
  }
}
