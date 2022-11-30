import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  InjectFlags,
  Injector,
  Input,
  NgZone,
  Optional,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  animationFrameScheduler,
  combineLatest,
  EMPTY,
  fromEvent,
  merge,
  Observable,
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
  pairwise,
  share,
  startWith,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { BERG_LAYOUT_ELEMENT } from '../layout/layout-model-private';
import { BergPanelControllerStore } from './panel-controller-store';
import {
  BergPanelComponentInputs,
  BergPanelInputs,
  BergPanelOutputBindingMode,
  BergPanelOutputs,
  BergPanelSlot,
  BergPanelSnap,
  BERG_PANEL_DEFAULT_INPUTS,
  BERG_PANEL_INPUTS,
} from './panel-model';
import {
  BACKDROP_ANIMATION_DURATION,
  BACKDROP_Z_INDEX,
  BergPanelResizeSize,
  TWO_DIMENSION_COLLECTION_DISTANCE,
} from './panel-model-private';
import {
  BergPanelOutputBinding,
  BERG_PANEL_OUTPUT_BINDINGS,
} from './panel-output-bindings';
import { filterSizeDirection } from './panel-util';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'berg-panel',
    '[class.berg-panel-absolute]': 'absolute',
    '[class.berg-panel-hidden]': '_hidden',
    '[class.berg-panel-snap-expanded]': 'snap === "expanded"',
    '[class.berg-panel-snap-collapsed]': 'snap === "collapsed"',
    '[class.berg-panel-resize-resizing]': '_resizing',
    '[class.berg-panel-resize-previewing]': '_previewing',
    '[class.berg-panel-resize-disabled]': 'resizeDisabled',
    '[class.berg-panel-vertical]': 'isVertical',
    '[class.berg-panel-horizontal]': 'isHorizontal',
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
    '[class.berg-panel-center]': 'slot === "center"',
    '[class.berg-panel-top-above-left]':
      'controller.topLeftPosition === "above"',
    '[class.berg-panel-top-above-right]':
      'controller.topRightPosition === "above"',
    '[class.berg-panel-bottom-below-left]':
      'controller.bottomLeftPosition === "below"',
    '[class.berg-panel-bottom-below-right]':
      'controller.bottomRightPosition === "below"',
    '[style.width.px]': '_size?.width',
    '[style.height.px]': '_size?.height',
    '[style.margin]': '_margin',
    '[style.transition]': '_enableTransition ? null : "none"',
    '(transitionend)': '_onTransitionend()',
  },
})
export class BergPanelComponent
  implements BergPanelComponentInputs, BergPanelOutputs
{
  @Input('slot')
  get slot(): BergPanelSlot {
    return this._slot;
  }
  set slot(value: BergPanelSlot | null) {
    this._slot = value ?? this.getDefaultInput('slot');
    this.slotSub.next(this._slot);
  }
  private _slot: BergPanelSlot = 'center';
  protected slotSub = new ReplaySubject<BergPanelSlot>(1);

  @Input()
  get absolute(): boolean {
    return this._absolute;
  }
  set absolute(value: boolean | null) {
    this._absolute = coerceBooleanProperty(
      value ?? this.getDefaultInput('absolute')
    );
    this.updateBackdrop();
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
    return this._resizeDisabled || this.controller.resizeDisabled;
  }
  set resizeDisabled(value: boolean | null) {
    this._resizeDisabled = coerceBooleanProperty(
      value ?? this.getDefaultInput('resizeDisabled')
    );
  }
  private _resizeDisabled: boolean;

  @Input()
  get snap(): BergPanelSnap {
    return this._snap;
  }
  set snap(value: BergPanelSnap | null) {
    this._snap = value ?? this.getDefaultInput('snap');
  }
  private _snap: BergPanelSnap = this.getDefaultInput('snap');

  @Input()
  get initialSize(): number {
    return this._initialSize;
  }
  set initialSize(value: number | null) {
    this._initialSize =
      coerceNumberProperty(value) ?? this.getDefaultInput('initialSize');
  }
  private _initialSize: number = this.getDefaultInput('initialSize');

  @Input()
  get resizeCollapseSize(): number | null {
    return this._resizeCollapseSize;
  }
  set resizeCollapseSize(value: number | null) {
    this._resizeCollapseSize =
      value ?? this.getDefaultInput('resizeCollapseSize');
  }
  private _resizeCollapseSize: number | null =
    this.getDefaultInput('resizeCollapseSize');

  @Input()
  get resizeExpandSize(): number | null {
    return this._resizeExpandSize;
  }
  set resizeExpandSize(value: number | null) {
    this._resizeExpandSize = value ?? this.getDefaultInput('resizeExpandSize');
  }
  private _resizeExpandSize: number | null =
    this.getDefaultInput('resizeExpandSize');

  @Input()
  set outputBindingMode(value: BergPanelOutputBindingMode | null) {
    this._outputBindingMode =
      value ?? this.getDefaultInput('outputBindingMode');
  }
  private _outputBindingMode = this.getDefaultInput('outputBindingMode');

  _resizing = false;
  _previewing = false;
  _size: number;
  _margin: string | null;
  _backdropElement: HTMLElement;
  _layoutElement: HTMLElement;
  _hidden: boolean;
  _enableTransition: boolean;

  get isVertical(): boolean {
    return this.slot === 'left' || this.slot === 'right';
  }

  get isHorizontal(): boolean {
    return this.slot === 'top' || this.slot === 'bottom';
  }

  private controller = this.panelControllerStore.get(this.getLayoutElement());

  private destroySub = new Subject<void>();

  private resizeToggle$ = this.slotSub.pipe(
    map((slot) => {
      return slot === 'center' ? null : this.controller.resizeToggles[slot];
    })
  );

  private previewing$ = this.slotSub.pipe(
    switchMap((slot) => {
      return merge(
        this.controller
          .fromResizeTogglesEvent<MouseEvent>('mousemove', slot)
          .pipe(
            withLatestFrom(this.resizeToggle$),
            filter(() => !this.resizeDisabled),
            map(([event, resizeToggle]) => {
              return this.checkResizeThreshold(event, resizeToggle);
            })
          ),
        this.controller
          .fromResizeTogglesEvent<MouseEvent>('mouseleave', slot)
          .pipe(map(() => false))
      );
    }),
    startWith(false),
    distinctUntilChanged(),
    share()
  );

  private delayedPreviewing$ = this.previewing$.pipe(
    switchMap((previewing) => {
      return of(previewing).pipe(
        delay(previewing ? this.controller.resizePreviewDelay : 0)
      );
    })
  );

  private resizeEvent$ = this.previewing$.pipe(
    filter(() => !this.resizeDisabled),
    switchMap((previewing) => {
      return previewing
        ? this.controller.fromLayoutEvent<MouseEvent>('mousedown')
        : EMPTY;
    })
  );

  private stopResizeEvent$ = merge(
    fromEvent<MouseEvent>(this.document.body, 'mouseup'),
    fromEvent<MouseEvent>(this.document.body, 'mouseleave'),
    fromEvent<DragEvent>(this.document.body, 'dragend')
  );

  private resizing$ = merge(
    this.resizeEvent$.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(share(), startWith(false), distinctUntilChanged());

  private resizedSize$ = this.resizeEvent$.pipe(
    switchMap(() =>
      this.controller
        .fromLayoutEvent<MouseEvent>('mousemove')
        .pipe(takeUntil(this.stopResizeEvent$))
    ),
    debounceTime(0, animationFrameScheduler),
    map((event) => this.calculateSize(event)),
    share()
  );

  private increasingSize$ = this.resizedSize$.pipe(filterSizeDirection(true));
  private decreasingSize$ = this.resizedSize$.pipe(filterSizeDirection(false));

  private startResizeCollapse$ = this.decreasingSize$.pipe(
    map((size) => {
      if (!this.canSnap() || !this.resizeCollapseSize) {
        return false;
      }

      if (size.width !== undefined) {
        return (
          this.resizeCollapseSize - this.controller.resizeCollapseOffset >=
          size.width
        );
      }

      if (size.height !== undefined) {
        return (
          this.resizeCollapseSize - this.controller.resizeCollapseOffset >=
          size.height
        );
      }

      return false;
    }),
    pairwise(),
    // only snap on two subsequent snapping resizes
    // to prevent users from snapping by rapidly resizing from an expanded snap
    filter(([previous, current]) => previous && current),
    map(([_, size]) => size),
    share()
  );

  private stopResizeCollapse$ = this.increasingSize$.pipe(
    filter((size) => {
      if (this._snap !== 'collapsed' || !this.resizeCollapseSize) {
        return false;
      }

      if (size.width !== undefined) {
        return size.width >= this.resizeCollapseSize;
      }

      if (size.height !== undefined) {
        return size.height >= this.resizeCollapseSize;
      }

      return false;
    })
  );

  private resizeCollapsed$ = merge(
    this.startResizeCollapse$.pipe(map(() => true)),
    this.stopResizeCollapse$.pipe(map(() => false))
  ).pipe(startWith(false));

  private startResizeExpand$ = this.increasingSize$.pipe(
    filter((size) => {
      if (!this.canSnap() || !this.resizeExpandSize) {
        return false;
      }

      if (size.width !== undefined) {
        return (
          size.width >=
          this.resizeExpandSize - this.controller.resizeExpandOffset
        );
      }

      if (size.height !== undefined) {
        return (
          size.height >=
          this.resizeExpandSize - this.controller.resizeExpandOffset
        );
      }

      return false;
    }),
    share()
  );

  private stopResizeExpand$ = this.decreasingSize$.pipe(
    filter((size) => {
      if (this._snap !== 'expanded' || !this.resizeExpandSize) {
        return false;
      }

      if (size.width !== undefined) {
        return size.width <= this.resizeExpandSize;
      }

      if (size.height !== undefined) {
        return size.height <= this.resizeExpandSize;
      }

      return false;
    })
  );

  private resizeExpanded$ = merge(
    this.startResizeExpand$.pipe(map(() => true)),
    this.stopResizeExpand$.pipe(map(() => false))
  ).pipe(startWith(false));

  private snap$: Observable<BergPanelSnap> = combineLatest([
    this.resizeExpanded$,
    this.resizeCollapsed$,
  ]).pipe(
    map(([expanded, collapsed]) => {
      if (expanded && !collapsed && this._snap !== 'collapsed') {
        return 'expanded';
      } else if (collapsed && !expanded && this._snap !== 'expanded') {
        return 'collapsed';
      } else {
        return 'none';
      }
    }),
    distinctUntilChanged((a, b) => a === b && b === this._snap)
  );

  @Output() snapped = new EventEmitter<BergPanelSnap>();
  @Output() backdropClicked = new EventEmitter<MouseEvent>();

  private get hostElem() {
    return this.elementRef.nativeElement;
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT)
    private document: Document,
    private panelControllerStore: BergPanelControllerStore,
    private elementRef: ElementRef<HTMLElement>,
    private zone: NgZone,
    protected injector: Injector,
    @Inject(BERG_PANEL_INPUTS)
    @Optional()
    protected inputs: BergPanelInputs
  ) {
    this._layoutElement = this.getLayoutElement();
    this.subscribe();
    this.controller.add(this);
  }

  /** Collapses the panel programmatically. Consider using the collapsed-input instead. */
  collapse(): void {
    if (!this.slot) {
      return;
    }

    const { width, height } = this.hostElem.getBoundingClientRect();

    if (this.slot === 'left') {
      this._margin = `0 0 0 -${width}px`;
    } else if (this.slot === 'right') {
      this._margin = `0 -${width}px 0 0`;
    } else if (this.slot === 'top') {
      this._margin = `-${height}px 0 0 0`;
    } else {
      this._margin = `0 0 -${height}px 0`;
    }

    this.controller.updateSize(this.slot, 0);
    this.changeDetectorRef.markForCheck();
  }

  /** Expands the panel programmatically. Consider using the collapsed-input instead. */
  expand(): void {
    if (!this.slot) {
      return;
    }

    requestAnimationFrame(() => {
      this._margin = null;
      this.controller.updateSize(this.slot, this._size);
      this.changeDetectorRef.markForCheck();
    });
  }

  _onTransitionend() {
    if (this.collapsed) {
      this._hidden = true;
    }
  }

  private showBackdrop(): void {
    const backdrop = this.getBackdropElement();
    this._layoutElement.appendChild(backdrop);
    requestAnimationFrame(() => (backdrop.style.opacity = '1'));
    this._backdropElement.style.pointerEvents = 'auto';
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();
    if (this._layoutElement.contains(backdrop)) {
      this._backdropElement.style.opacity = '0';
      this._backdropElement.style.pointerEvents = 'none';

      setTimeout(
        () => this._layoutElement.removeChild(backdrop),
        BACKDROP_ANIMATION_DURATION
      );
    }
  }

  private updateBackdrop(): void {
    if (this.absolute && !this.collapsed) {
      this.showBackdrop();
    } else {
      this.hideBackdrop();
    }
  }

  private getBackdropElement(): HTMLElement {
    if (!this._backdropElement) {
      this._backdropElement = this.document.createElement('div');
      this._backdropElement.classList.add('berg-panel-backdrop');
      this._backdropElement.style.transition = `opacity ${BACKDROP_ANIMATION_DURATION}ms ease-in`;
      this._backdropElement.style.zIndex = BACKDROP_Z_INDEX.toString();
      this._backdropElement.style.position = 'fixed';
      this._backdropElement.style.cursor = 'pointer';
      this._backdropElement.style.opacity = '0';
      this._backdropElement.style.top =
        this._backdropElement.style.right =
        this._backdropElement.style.bottom =
        this._backdropElement.style.left =
          '0';

      fromEvent<MouseEvent>(this._backdropElement, 'click')
        .pipe(takeUntil(this.destroySub))
        .subscribe((event) => {
          this.backdropClicked.emit(event);
          this.updateBindings('onBackdropClicked', event);
        });
    }

    return this._backdropElement;
  }

  private subscribeToResizing(): void {
    if (this.slot === 'center') {
      return;
    }

    this.subscribeForAssignment('_resizing', this.resizing$);
    this.subscribeForAssignment('_previewing', this.delayedPreviewing$);

    this.resizedSize$.pipe(takeUntil(this.destroySub)).subscribe((size) => {
      const directionalSize = this.isHorizontal ? size.height : size.width;

      if (directionalSize !== undefined) {
        this._size = directionalSize;
        this.updateClampedVariable();
      }
    });

    combineLatest([this.previewing$, this.resizing$])
      .pipe(takeUntil(this.destroySub))
      .subscribe(([previewing, resizing]) => {
        const resizeClass =
          this.slot === 'bottom' || this.slot === 'top'
            ? 'berg-layout-resizing-vertical'
            : 'berg-layout-resizing-horizontal';

        if (previewing || resizing) {
          this._layoutElement.classList.add(resizeClass);
        } else {
          this._layoutElement.classList.remove(resizeClass);
        }
      });

    merge(fromEvent<DragEvent>(this.hostElem, 'dragstart'))
      .pipe(takeUntil(this.destroySub))
      .subscribe((event) => event.preventDefault());

    this.slotSub
      .pipe(startWith(this._slot), takeUntil(this.destroySub))
      .subscribe((slot) => {
        if (slot !== 'center') {
          this.hostElem.appendChild(this.controller.resizeToggles[slot]);
        }
      });
  }

  private calculateSize(event: MouseEvent): BergPanelResizeSize {
    const rect = this.hostElem.getBoundingClientRect();

    if (this.slot === 'bottom') {
      return {
        rect,
        event,
        height:
          rect.height +
          this.document.documentElement.scrollTop +
          rect.y -
          event.pageY,
      };
    }

    if (this.slot === 'left') {
      return { rect, event, width: event.pageX - rect.x };
    }

    if (this.slot === 'top') {
      return {
        rect,
        event,
        height: event.pageY - rect.y - this.document.documentElement.scrollTop,
      };
    }

    return { rect, event, width: rect.width + rect.x - event.pageX };
  }

  private checkResizeThreshold(
    event: MouseEvent,
    resizeToggle: HTMLElement | null
  ): boolean {
    if (resizeToggle === null || this.slot === 'center') {
      return false;
    }

    if (event.target === resizeToggle) {
      return true;
    }

    if (!this.controller.resizeTwoDimensions) {
      return false;
    }

    let mouse = 0;
    let origin = 0;

    const { x, y, width, height } = resizeToggle.getBoundingClientRect();

    if (width === 0 || height === 0) {
      return false;
    }

    if (this.slot === 'bottom') {
      mouse = event.pageY;
      origin = y;
    } else if (this.slot === 'left') {
      mouse = event.pageX;
      origin = x + width;
    } else if (this.slot === 'top') {
      mouse = event.pageY;
      origin = height + y;
    } else if (this.slot === 'right') {
      mouse = event.pageX;
      origin = x;
    }

    return TWO_DIMENSION_COLLECTION_DISTANCE > Math.abs(origin - mouse);
  }

  protected getLayoutElement(): HTMLElement {
    if (!this._layoutElement) {
      this._layoutElement = this.findLayoutElement();
    }

    return this._layoutElement;
  }

  private findLayoutElement(): HTMLElement {
    const injected = this.injector.get(
      BERG_LAYOUT_ELEMENT,
      null,
      InjectFlags.SkipSelf
    );

    if (injected) {
      return injected.hostElem;
    }

    // In Angular, the panel can find its layout using dependency injection.
    // But this will not work when the component runs as a web-component.
    // Use the DOM to grab the layout instead.
    let elem: HTMLElement | null = this.hostElem;

    while (elem) {
      if (elem.tagName === LAYOUT_TAGNAME) {
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

  private canSnap(): boolean {
    return this._snap === 'none';
  }

  private getDefaultInput<T extends keyof BergPanelInputs>(
    input: T
  ): BergPanelInputs[T] {
    if (this.inputs) {
      return this.inputs[input];
    }

    return BERG_PANEL_DEFAULT_INPUTS[input];
  }

  private updateClampedVariable(): void {
    if (this.resizeExpandSize && this._size > this.resizeExpandSize) {
      return;
    }

    if (this.resizeCollapseSize && this._size < this.resizeCollapseSize) {
      return;
    }

    this.controller.updateSize(this.slot, this._size);
  }

  private subscribe(): void {
    this.snap$.pipe(takeUntil(this.destroySub)).subscribe((snap) => {
      this.snapped.emit(snap);
      this.updateBindings('onSnapped', snap);

      if (snap === 'collapsed') {
        this.controller.updateSize(this.slot, 0);
      } else if (snap === 'expanded') {
        this.controller.updateSize(this.slot, this._size);
      }
    });

    this.zone.onStable
      .pipe(delay(0), take(1), takeUntil(this.destroySub))
      .subscribe(() => {
        this._enableTransition = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  private subscribeForAssignment<T extends keyof this>(
    key: T,
    observable$: Observable<this[T]>
  ): void {
    observable$
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((value) => {
        this[key] = value;
        this.changeDetectorRef.markForCheck();
      });
  }

  // too much weirdness for TS to handle
  private updateBindings<T extends keyof BergPanelOutputBinding>(
    binding: T,
    ...params: Parameters<BergPanelOutputBinding[T]>
  ): void {
    const updates = BERG_PANEL_OUTPUT_BINDINGS[this._outputBindingMode][
      binding
    ](...(params as [any]));

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        continue;
      }

      this[key as keyof this] = value as any;

      if (key === 'collapsed') {
        this.animateCollapsedChanges();
      }
    }
  }

  private animateCollapsedChanges(): void {
    this.updateBackdrop();

    // do not animate if the panel it is snapped
    if (this.collapsed && this._snap === 'collapsed') {
      this._hidden = true;
      return;
    }

    this._hidden = false;

    if (this.collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** @hidden */
  ngOnInit(): void {
    this.subscribeToResizing();
    this._size = this.initialSize;
    this.controller.updateSize(this.slot, this._size);
  }

  /** @hidden */
  ngOnChanges(change: SimpleChanges): void {
    if (change['collapsed']) {
      // do not animate if the panel if it is initially collapsed, just set the margins and hide it
      if (change['collapsed'].isFirstChange()) {
        if (this.collapsed) {
          requestAnimationFrame(() => {
            this.collapse();
            this._hidden = true;
          });
        }
      } else {
        this.animateCollapsedChanges();
      }
    }

    if (change['initialSize'] && !change['initialSize'].isFirstChange()) {
      this._size = this.initialSize;
      this.controller.updateSize(this.slot, this._size);
    }

    if (change['absolute']) {
      this.controller.updateAbsolute(this.slot, this.absolute);
    }

    // since panels mutate through @Input, push here to update the panel$-stream
    if (change['absolute'] || change['collapsed'] || change['slot']) {
      this.controller.push();
    }
  }

  /** @hidden */
  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
    this.controller.remove(this);
    this.controller.updateSize(this.slot, 0);
  }
}

const LAYOUT_TAGNAME = 'BERG-LAYOUT';
