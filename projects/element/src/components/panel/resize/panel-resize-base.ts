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
  defer,
  EMPTY,
  fromEvent,
  merge,
  of,
  ReplaySubject,
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
import { BergPanelSlot } from '..';
import { BodyListeners } from '../../../core';
import { BergPanelController } from '../panel-controller';
import {
  BergResizeInputs,
  BergResizePosition,
  BergResizeSize,
  BERG_RESIZE_DEFAULT_INPUTS,
  BERG_RESIZE_EXPAND_PADDING,
  BERG_RESIZE_INPUTS,
} from './panel-resize-model';

@Directive({
  host: {
    '[class.berg-resize-resizing]': '_resizing',
    '[class.berg-resize-previewing]': '_previewing',
    '[class.berg-resize-collapsed]': '_resizeCollapsed',
    '[style.width.px]': '_size?.width',
    '[style.height.px]': '_size?.height',
    '[style.box-sizing]': '"border-box"',
  },
})
export abstract class BergPanelResizeBase implements OnInit, OnDestroy {
  /** Position of the resize toggle. */
  @Input()
  get resizePosition() {
    return this._resizePosition ?? this._slotResizePosition;
  }
  set resizePosition(value: BergResizePosition) {
    this._resizePosition = value;
  }
  private _resizePosition: BergResizePosition = this.getInput('resizePosition');

  /** Threshold to determine if a cursor position should be able to resize the element. */
  @Input()
  get resizeThreshold() {
    return this._resizeThreshold;
  }
  set resizeThreshold(value: number) {
    this._resizeThreshold = value;
  }
  private _resizeThreshold: number = this.getInput('resizeThreshold');

  /** Threshold to determine when a resize should be interpreted as a collapsing event. */
  @Input()
  get resizeCollapseThreshold() {
    return this._resizeCollapseThreshold;
  }
  set resizeCollapseThreshold(value: number) {
    this._resizeCollapseThreshold = value;
  }
  private _resizeCollapseThreshold: number = this.getInput(
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
  private _resizePreviewDelay: number = this.getInput('resizePreviewDelay');

  /** Delay before the resize preview is shown. */
  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = value;
  }
  private _resizeTwoDimensions: boolean = this.getInput('resizeTwoDimensions');

  /** Whether resizing is disabled. */
  @Input()
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean = this.getInput('resizeDisabled');

  /** Slot name to position the resize toggle. */
  @Input('slot')
  get slot() {
    return this._slot;
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

    this._slot = value;
    this._controller.push();
    this.slotSub.next(value);
  }
  private _slot: BergPanelSlot = 'center';
  protected slotSub = new ReplaySubject<BergPanelSlot>(1);
  private _slotResizePosition: BergResizePosition;

  _resizing = false;
  _previewing = false;
  _resizeCollapsed = false;
  _size: BergResizeSize;
  abstract _controller: BergPanelController;

  protected destroySub = new Subject<void>();

  get hostElem(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  resizeToggle$ = this.slotSub.pipe(
    map((slot) => this._controller.getResizeToggle(slot))
  );

  protected previewing$ = defer(() => {
    return merge(
      this._controller.fromResizeTogglesEvent<MouseEvent>('mousemove').pipe(
        withLatestFrom(this.resizeToggle$),
        filter(() => !this._resizeDisabled),
        map(([event, resizeToggle]) =>
          this.checkResizeThreshold(event, resizeToggle)
        )
      ),
      this._controller
        .fromResizeTogglesEvent<MouseEvent>('mouseleave')
        .pipe(map(() => false))
    ).pipe(startWith(false), distinctUntilChanged(), share());
  });

  protected resizeEvent$ = this.previewing$.pipe(
    filter(() => !this._resizeDisabled),
    switchMap((previewing) => {
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
        return this.resizeCollapseThreshold >= size.width / size.rect.width;
      }

      if (size.height !== undefined) {
        return this.resizeCollapseThreshold >= size.height / size.rect.height;
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
          return of(previewing).pipe(
            delay(previewing ? this.resizePreviewDelay : 0)
          );
        }),
        takeUntil(this.destroySub)
      )
      .subscribe((previewing) => (this._previewing = previewing));

    this.resizedSize$
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((size) => (this._size = size));

    merge(fromEvent<DragEvent>(this.hostElem, 'dragstart'))
      .pipe(takeUntil(this.destroySub))
      .subscribe((event) => event.preventDefault());

    this.collapsed$.pipe(takeUntil(this.destroySub)).subscribe((collapsed) => {
      this._resizeCollapsed = collapsed;
    });

    this.slotSub
      .pipe(
        startWith(this._slot),
        switchMap((slot) => this._controller.getRenderedResizeToggles(slot)),
        takeUntil(this.destroySub)
      )
      .subscribe((resizeToggles) => this.appendResizeToggles(resizeToggles));
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

  private checkResizeThreshold(
    event: MouseEvent,
    resizeToggle: HTMLElement | null
  ): boolean {
    if (resizeToggle === null || !this.resizePosition) {
      return false;
    }

    if (event.target === resizeToggle) {
      return true;
    }

    if (!this.resizeTwoDimensions) {
      return false;
    }

    let mouse = 0;
    let origin = 0;

    const { x, y, width, height } = resizeToggle.getBoundingClientRect();

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

  private appendResizeToggles(resizeToggles: HTMLElement[]): void {
    for (const resizeToggle of resizeToggles) {
      this.hostElem.appendChild(resizeToggle);
    }
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
