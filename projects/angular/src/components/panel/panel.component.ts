import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { BERG_LAYOUT_ELEMENT } from '../layout/layout-model-private';
import { BergPanelControllerStore } from './panel-controller-store';
import {
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
  SNAP_PADDING,
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
    '[class.berg-panel-vertical]': 'slot === "left" || slot === "right"',
    '[class.berg-panel-horizontal]': 'slot === "top" || slot === "bottom"',
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
    '[class.berg-panel-center]': 'slot === "center"',
    '[class.berg-panel-between]':
      'slot === "top" && controller.topPosition === "between" || slot === "bottom" && controller.bottomPosition === "between"',
    '[style.width.px]': '_size?.width',
    '[style.height.px]': '_size?.height',
    '[style.margin]': '_margin',
    '(transitionend)': '_onTransitionend()',
  },
})
export class BergPanelComponent
  implements BergPanelInputs, BergPanelInputs, BergPanelOutputs
{
  @Input('slot')
  set slot(value: BergPanelSlot) {
    this._slot = value;
    this.slotSub.next(value);
  }
  get slot() {
    return this._slot;
  }
  private _slot: BergPanelSlot = 'center';
  protected slotSub = new ReplaySubject<BergPanelSlot>(1);

  @Input()
  set absolute(value: boolean) {
    this._absolute = coerceBooleanProperty(value);
    this.updateBackdrop();
  }
  get absolute() {
    return this._absolute;
  }
  private _absolute: boolean = this.getInput('collapsed');

  @Input()
  set collapsed(value: boolean) {
    this._collapsed = coerceBooleanProperty(value);
    this.animateCollapsedChanges();
  }
  get collapsed() {
    return this._collapsed;
  }
  private _collapsed: boolean = this.getInput('collapsed');

  @Input()
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  get resizeDisabled() {
    return this._resizeDisabled || this.controller.resizeDisabled;
  }
  private _resizeDisabled: boolean;

  @Input()
  set snap(value: BergPanelSnap) {
    this._snap = value;
  }
  get snap() {
    return this._snap;
  }
  private _snap: BergPanelSnap = this.getInput('snap');

  @Input()
  set outputBindingMode(value: BergPanelOutputBindingMode) {
    this._outputBindingMode = value;
  }
  private _outputBindingMode = this.getInput('outputBindingMode');

  _resizing = false;
  _previewing = false;
  _size: BergPanelResizeSize;
  _margin: string | null;
  _backdropElement: HTMLElement;
  _layoutElement: HTMLElement;
  _hidden: boolean;

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
    pairwise(),
    map(([previous, size]) => {
      if (!this.canSizeSnap(previous, size)) {
        return false;
      }

      if (size.width !== undefined) {
        return (
          size.rect.width - size.width >= this.controller.resizeCollapseOffset
        );
      }

      if (size.height !== undefined) {
        return (
          size.rect.height - size.height >= this.controller.resizeCollapseOffset
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
      if (this._snap !== 'collapsed') {
        return false;
      }

      if (size.width !== undefined) {
        return size.width > this.controller.resizeCollapseOffset;
      }

      if (size.height !== undefined) {
        return size.height > this.controller.resizeCollapseOffset;
      }

      return false;
    })
  );

  private resizeCollapsed$ = merge(
    this.startResizeCollapse$.pipe(map(() => true)),
    this.stopResizeCollapse$.pipe(map(() => false))
  ).pipe(startWith(false));

  private startResizeExpand$ = this.increasingSize$.pipe(
    pairwise(),
    filter(([previous, size]) => {
      if (!this.canSizeSnap(previous, size)) {
        return false;
      }

      if (size.width !== undefined) {
        return (
          size.width - size.rect.width >= this.controller.resizeExpandOffset
        );
      }

      if (size.height !== undefined) {
        return (
          size.height - size.rect.height >= this.controller.resizeExpandOffset
        );
      }

      return false;
    }),
    map(([_, size]) => size),
    share()
  );

  private stopResizeExpand$ = this.decreasingSize$.pipe(
    withLatestFrom(this.startResizeExpand$.pipe(startWith(null))),
    filter(([size, expandAtSize]) => {
      if (this._snap !== 'expanded') {
        return false;
      }

      const { width, height } =
        expandAtSize ?? this.hostElem.getBoundingClientRect();

      if (size.width !== undefined && width !== undefined) {
        return width - SNAP_PADDING > size.width;
      }

      if (size.height !== undefined && height !== undefined) {
        return height - SNAP_PADDING > size.height;
      }

      return false;
    })
  );

  private resizeExpanded$ = merge(
    this.startResizeExpand$.pipe(map(() => true)),
    this.stopResizeExpand$.pipe(map(() => false))
  ).pipe(startWith(false));

  private snapped$: Observable<BergPanelSnap> = combineLatest([
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
    protected injector: Injector,
    @Inject(BERG_PANEL_INPUTS)
    @Optional()
    protected inputs: BergPanelInputs
  ) {
    this._layoutElement = this.getLayoutElement();
    this.subscribe();
    this.controller.add(this);
  }

  /** Collapses the panel programmatically. Consider using the collapse-input instead. */
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

    this.changeDetectorRef.markForCheck();
  }

  /** Expands the panel programmatically. Consider using the collapse-input instead. */
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
    if (this.collapsed) {
      this._hidden = true;
    }
  }

  private showBackdrop(): void {
    const backdrop = this.getBackdropElement();
    this._layoutElement.appendChild(backdrop);
    requestAnimationFrame(() => (backdrop.style.opacity = '1'));
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();
    if (this._layoutElement.contains(backdrop)) {
      this._backdropElement.style.opacity = '0';

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
      this._backdropElement.style.position = 'absolute';
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
    this.subscribeForAssignment('_size', this.resizedSize$);

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
      return { rect, event, height: rect.height + rect.y - event.pageY };
    }

    if (this.slot === 'left') {
      return { rect, event, width: event.pageX - rect.x };
    }

    if (this.slot === 'top') {
      return { rect, event, height: event.pageY - rect.y };
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

  private canSizeSnap(
    previousSize: BergPanelResizeSize,
    size: BergPanelResizeSize
  ): boolean {
    return (
      this._snap === 'none' &&
      previousSize.rect.width === size.rect.width &&
      previousSize.rect.height === size.rect.height
    );
  }

  private getInput<T extends keyof BergPanelInputs>(
    input: T
  ): BergPanelInputs[T] {
    if (this.inputs) {
      return this.inputs[input];
    }

    return BERG_PANEL_DEFAULT_INPUTS[input];
  }

  private subscribe(): void {
    this.snapped$.pipe(takeUntil(this.destroySub)).subscribe((snapped) => {
      this.snapped.emit(snapped);
      this.updateBindings('onSnapped', snapped);
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
      this[key as keyof this] = value as any;
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
  }

  /** @hidden */
  ngOnChanges(change: SimpleChanges): void {
    if (change['collapsed']) {
      // do not animate if the panel is initially collapsed
      if (this.collapsed && change['collapsed'].isFirstChange()) {
        this._hidden = true;
      }
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
  }
}

const LAYOUT_TAGNAME = 'BERG-LAYOUT';
