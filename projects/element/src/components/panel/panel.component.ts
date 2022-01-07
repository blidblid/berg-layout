import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Optional,
  Output,
  ViewEncapsulation,
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
import { BodyListeners } from '../../core';
import { BergPanelControllerFactory } from './panel-controller-factory';
import {
  BergPanel,
  BergPanelInputs,
  BergPanelResizePosition,
  BergPanelResizeSize,
  BergPanelSlot,
  BERG_PANEL_DEFAULT_INPUTS,
  BERG_PANEL_INPUTS,
  BERG_RESIZE_EXPAND_PADDING,
} from './panel-model';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClass',
    '[class.berg-panel]': 'true',
    '[class.berg-panel-absolute]': 'absolute',
    '[class.berg-panel-hidden]': '_hidden',
    '[class.berg-panel-resizing]': '_resizing',
    '[class.berg-panel-previewing]': '_previewing',
    '[class.berg-panel-collapsed]': '_resizeCollapsed',
    '[class.berg-panel-vertical]': 'slot === "left" || slot === "right"',
    '[class.berg-panel-horizontal]': 'slot === "top" || slot === "bottom"',
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
    '[class.berg-panel-center]': 'slot === "center"',
    '[style.width.px]': '_size?.width',
    '[style.height.px]': '_size?.height',
    '[style.box-sizing]': '"border-box"',
    '[style.margin]': '_margin',
    '(transitionend)': '_onTransitionend()',
  },
})
export class BergPanelComponent implements BergPanel {
  /** Whether the panel is absolutely positioned. */
  @Input()
  get absolute() {
    return this._absolute;
  }
  set absolute(value: boolean) {
    this._absolute = coerceBooleanProperty(value);
    this.updateBackdrop();
    this._controller.push();
  }
  private _absolute: boolean = this.getInput('absolute');

  /** Whether the panel is collapsed. */
  @Input()
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(value: boolean) {
    this._collapsed = coerceBooleanProperty(value);

    if (this._collapsed && !this._init) {
      this._hidden = true;
      return;
    } else {
      this._hidden = false;
    }

    this.updateBackdrop();
    this._controller.push();

    if (this._collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  private _collapsed: boolean = this.getInput('collapsed');
  _hidden: boolean;

  /** Mobile resolution breakpoint. */
  @Input()
  set mobileBreakpoint(value: string) {
    this.mobileBreakpointSub.next(value);
  }
  private mobileBreakpointSub = new BehaviorSubject<string>(
    this.getInput('mobileBreakpoint')
  );

  /** Small resolution breakpoint. */
  @Input()
  set smallBreakpoint(value: string) {
    this.smallBreakpointSub.next(value);
  }
  private smallBreakpointSub = new BehaviorSubject<string>(
    this.getInput('smallBreakpoint')
  );

  /** Medium resolution breakpoint. */
  @Input()
  set mediumBreakpoint(value: string) {
    this.mediumBreakpointSub.next(value);
  }
  private mediumBreakpointSub = new BehaviorSubject<string>(
    this.getInput('mediumBreakpoint')
  );

  /** Position of the resize toggle. */
  @Input()
  get resizePosition() {
    return this._resizePosition ?? this._slotResizePosition;
  }
  set resizePosition(value: BergPanelResizePosition) {
    this._resizePosition = value;
  }
  private _resizePosition: BergPanelResizePosition =
    this.getInput('resizePosition');

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

  /** Name of the content projection slot. */
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
  private slotSub = new ReplaySubject<BergPanelSlot>(1);
  private _slot: BergPanelSlot = 'center';
  private _slotResizePosition: BergPanelResizePosition;

  _resizing = false;
  _previewing = false;
  _resizeCollapsed = false;
  _size: BergPanelResizeSize;
  _margin: string | null;
  _hostClass: string;
  _layoutElement: HTMLElement;
  _backdropElement: HTMLElement;
  _init: boolean;
  _controller = this.controllerFactory.get(this.findLayoutParentElement());

  private destroySub = new Subject<void>();

  get hostElem(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  resizeToggle$ = this.slotSub.pipe(
    map((slot) => this._controller.getResizeToggle(slot))
  );

  private previewing$ = defer(() => {
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

  private resizeEvent$ = this.previewing$.pipe(
    filter(() => !this._resizeDisabled),
    switchMap((previewing) => {
      return previewing
        ? this._controller.fromLayoutEvent<MouseEvent>('mousedown')
        : EMPTY;
    })
  );

  private stopResizeEvent$ = merge(
    this.bodyListeners.mouseup$,
    this.bodyListeners.mouseleave$,
    this.bodyListeners.dragend$
  );

  private resizing$ = merge(
    this.resizeEvent$.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(startWith(false), distinctUntilChanged());

  private resizedSize$ = this.resizeEvent$.pipe(
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

  /** Emits whenever a user clicks a panel backdrop. */
  @Output() backdropClicked = new EventEmitter<void>();

  private hostClass$ = combineLatest([
    this.mobileBreakpointSub,
    this.smallBreakpointSub,
    this.mediumBreakpointSub,
  ]).pipe(
    map((breakpoints) => breakpoints.map(this.getBreakpoint)),
    switchMap(([mobile, small, medium]) => {
      return this.breakpointObserver
        .observe(
          [mobile, small, medium].filter(
            (breakpoint): breakpoint is string => !!breakpoint
          )
        )
        .pipe(
          map((state) => {
            if (state.breakpoints[mobile]) {
              return 'berg-panel-mobile';
            } else if (state.breakpoints[small]) {
              return 'berg-panel-small';
            } else if (state.breakpoints[medium]) {
              return 'berg-panel-medium';
            }

            return 'berg-panel-large';
          })
        );
    })
  );
  constructor(
    private bodyListeners: BodyListeners,
    private elementRef: ElementRef<HTMLElement>,
    private controllerFactory: BergPanelControllerFactory,
    private breakpointObserver: BreakpointObserver,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    @Inject(BERG_PANEL_INPUTS)
    @Optional()
    private inputs: BergPanelInputs
  ) {
    this._layoutElement = this.findLayoutParentElement();
    this.subscribe();

    // Life cycle hooks are bugged out in @angular/elements.
    this.zone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        this._controller.add(this);
        this._init = true;
      });
    });
  }

  collapse(): void {
    if (!this.slot) {
      return;
    }

    const { width, height } = this.hostElem.getBoundingClientRect();

    if ((this.slot = 'left')) {
      this._margin = `0 0 0 -${width}px`;
    } else if (this.slot === 'right') {
      this._margin === `0 -${width}px 0 0`;
    } else if (this.slot === 'top') {
      this._margin === `-${height}px 0 0 0`;
    } else {
      this._margin === `0 0 -${height}px 0`;
    }
  }

  expand(): void {
    if (!this.slot) {
      return;
    }

    requestAnimationFrame(() => {
      this._margin = null;
      this.changeDetectorRef.markForCheck();
    });
  }

  _onTransitionend() {
    if (this._collapsed) {
      this._hidden = true;
    }
  }

  private findLayoutParentElement(): HTMLElement {
    if (this._layoutElement) {
      return this._layoutElement;
    }

    let elem = this.elementRef.nativeElement;

    while (elem.parentElement) {
      if (elem.parentElement.tagName === 'BERG-LAYOUT') {
        return elem.parentElement;
      }

      elem = elem.parentElement;
    }

    throw new Error('berg-panel can only be used inside berg-layout');
  }

  private showBackdrop(): void {
    this._layoutElement.appendChild(this.getBackdropElement());
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();

    if (this._layoutElement.contains(backdrop)) {
      this._layoutElement.removeChild(backdrop);
    }
  }

  private updateBackdrop(): void {
    if (this._absolute && !this._collapsed) {
      this.showBackdrop();
    } else {
      this.hideBackdrop();
    }
  }

  private getBackdropElement(): HTMLElement {
    if (!this._backdropElement) {
      this._backdropElement = this.document.createElement('div');
      this._backdropElement.classList.add('berg-panel-backdrop');
      this._backdropElement.setAttribute(
        'style',
        [
          'position: absolute;',
          'top: 0;',
          'right: 0;',
          'bottom: 0;',
          'left: 0;',
          'z-index: 2;',
          'cursor: pointer;',
        ].join(' ')
      );

      fromEvent(this._backdropElement, 'click')
        .pipe(takeUntil(this.destroySub))
        .subscribe(() => this.backdropClicked.emit());
    }

    return this._backdropElement;
  }

  private subscribeToResize(): void {
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

  private calculateSize(event: MouseEvent): BergPanelResizeSize {
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

  private getInput<T extends keyof BergPanelInputs>(
    input: T
  ): BergPanelInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_PANEL_DEFAULT_INPUTS[input];
  }

  private subscribe(): void {
    this.hostClass$.pipe(takeUntil(this.destroySub)).subscribe((hostClass) => {
      this._hostClass = hostClass;
      this.changeDetectorRef.markForCheck();
    });

    combineLatest([this.previewing$, this.resizing$])
      .pipe(takeUntil(this.destroySub))
      .subscribe(([previewing, resizing]) => {
        const resizeClass =
          this.resizePosition === 'above' || this.resizePosition === 'below'
            ? 'berg-layout-resize-vertical'
            : 'berg-layout-resize-horizontal';

        if (previewing || resizing) {
          this._layoutElement.classList.add(resizeClass);
        } else {
          this._layoutElement.classList.remove(resizeClass);
        }
      });
  }

  private getBreakpoint(breakpoint?: string): string {
    return breakpoint ? `(max-width: ${breakpoint})` : '';
  }

  ngOnInit(): void {
    this.subscribeToResize();
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
    this._controller.remove(this);
  }
}
