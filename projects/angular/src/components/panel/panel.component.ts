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
  BergPanelResizeEvent,
  BergPanelSlot,
  BERG_PANEL_DEFAULT_INPUTS,
  BERG_PANEL_INPUTS,
} from './panel-model';
import {
  BACKDROP_ANIMATION_DURATION,
  BACKDROP_Z_INDEX,
  TWO_DIMENSION_COLLECTION_DISTANCE,
} from './panel-model-private';
import {
  BergPanelOutputBinding,
  BERG_PANEL_OUTPUT_BINDINGS,
} from './panel-output-bindings';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'berg-panel',
    '[class.berg-panel-absolute]': 'absolute',
    '[class.berg-panel-collapsed]': 'collapsed',
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
  set outputBindingMode(value: BergPanelOutputBindingMode | null) {
    this._outputBindingMode =
      value ?? this.getDefaultInput('outputBindingMode');
  }
  private _outputBindingMode = this.getDefaultInput('outputBindingMode');

  _resizing = false;
  _previewing = false;
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

  private resizeMouseEvent$ = this.previewing$.pipe(
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
    this.resizeMouseEvent$.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(share(), startWith(false), distinctUntilChanged());

  @Output('resized')
  resizeEvent$ = this.resizeMouseEvent$.pipe(
    switchMap(() =>
      this.controller
        .fromLayoutEvent<MouseEvent>('mousemove')
        .pipe(takeUntil(this.stopResizeEvent$))
    ),
    debounceTime(0, animationFrameScheduler),
    map((event) => this.createResizeEvent(event)),
    share()
  );

  @Output() resized = new EventEmitter<BergPanelResizeEvent>();
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

      // non-standard property to disable tap highlights
      (this._backdropElement.style as any).webkitTapHighlightColor =
        'rgba(0, 0, 0, 0)';

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

    this.resizeEvent$
      .pipe(takeUntil(this.destroySub))
      .subscribe((resizedSize) => {
        this.updateSize(resizedSize.size);
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

  private createResizeEvent(event: MouseEvent): BergPanelResizeEvent {
    const rect = this.hostElem.getBoundingClientRect();
    const layoutRect = this.controller.hostElem.getBoundingClientRect();

    const create = (size: number) => {
      return {
        rect,
        event,
        size: Math.max(size),
      };
    };

    if (this.slot === 'bottom') {
      return create(
        rect.height +
          this.document.documentElement.scrollTop +
          (layoutRect.y - rect.height) -
          event.pageY
      );
    }

    if (this.slot === 'left') {
      return create(
        event.pageX - layoutRect.x - this.document.documentElement.scrollLeft
      );
    }

    if (this.slot === 'top') {
      return create(
        event.pageY - layoutRect.y - this.document.documentElement.scrollTop
      );
    }

    return create(rect.width + (layoutRect.width - rect.width) - event.pageX);
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

  private getDefaultInput<T extends keyof BergPanelInputs>(
    input: T
  ): BergPanelInputs[T] {
    if (this.inputs) {
      return this.inputs[input];
    }

    return BERG_PANEL_DEFAULT_INPUTS[input];
  }

  private subscribe(): void {
    this.zone.onStable
      .pipe(delay(0), take(1), takeUntil(this.destroySub))
      .subscribe(() => {
        this._enableTransition = true;
        this.changeDetectorRef.markForCheck();
      });

    this.resizeEvent$
      .pipe(takeUntil(this.destroySub))
      .subscribe((resizedSize) => this.resized.emit(resizedSize));
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
    this._hidden = false;
  }

  private updateSize(size: number): void {
    if (this._minSize && size < this._minSize) {
      size = this._minSize;
    }

    if (this._maxSize && size > this._maxSize) {
      size = this._maxSize;
    }

    this.controller.updateSize(this.slot, size);
  }

  /** @hidden */
  ngOnInit(): void {
    this.subscribeToResizing();

    // set the initial size using the default value if no other value has been set
    this.controller.updateSize(this.slot, this._size);
  }

  /** @hidden */
  ngOnChanges(change: SimpleChanges): void {
    if (change['collapsed']) {
      this.controller.updateCollapsed(this.slot, this.collapsed);

      // do not animate if the panel if it is initially collapsed, just set the margins and hide it
      if (change['collapsed'].isFirstChange()) {
        if (this.collapsed) {
          requestAnimationFrame(() => {
            this._hidden = true;
          });
        }
      } else {
        this.animateCollapsedChanges();
      }
    }

    if (change['size'] && !change['size'].isFirstChange()) {
      this.updateSize(this._size);
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
