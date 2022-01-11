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
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  animationFrameScheduler,
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
import { BergCommonInputsBase } from '../../core/shared-inputs-base';
import { BergPanelControllerFactory } from './panel-controller-factory';
import {
  BergPanel,
  BergPanelInputs,
  BergPanelResizePosition,
  BergPanelResizeSize,
  BergPanelSlot,
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
    class: 'berg-panel',
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
export class BergPanelComponent
  extends BergCommonInputsBase
  implements BergPanel
{
  /** Name of the content projection slot. */
  @Input('slot')
  get slot() {
    return this._slot;
  }
  set slot(value: BergPanelSlot) {
    if (value === 'top') {
      this.resizePosition = 'below';
    } else if (value === 'right') {
      this.resizePosition = 'before';
    } else if (value === 'bottom') {
      this.resizePosition = 'above';
    } else if (value === 'left') {
      this.resizePosition = 'after';
    } else {
      this.resizePosition = null;
    }

    this._slot = value;
    this.slotSub.next(value);
  }
  private _slot: BergPanelSlot = 'center';
  protected slotSub = new ReplaySubject<BergPanelSlot>(1);
  private resizePosition: BergPanelResizePosition;

  _resizing = false;
  _previewing = false;
  _resizeCollapsed = false;
  _size: BergPanelResizeSize;
  _margin: string | null;
  _backdropElement: HTMLElement;
  _hidden: boolean;

  private init: boolean;
  private destroySub = new Subject<void>();

  get hostElem(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  private resizeToggle$ = this.slotSub.pipe(
    map((slot) => this.controller.getResizeToggle(slot))
  );

  private previewing$ = defer(() => {
    return merge(
      this.controller.fromResizeTogglesEvent<MouseEvent>('mousemove').pipe(
        withLatestFrom(this.resizeToggle$),
        filter(() => !this.resizeDisabled),
        map(([event, resizeToggle]) =>
          this.checkResizeThreshold(event, resizeToggle)
        )
      ),
      this.controller
        .fromResizeTogglesEvent<MouseEvent>('mouseleave')
        .pipe(map(() => false))
    ).pipe(startWith(false), distinctUntilChanged(), share());
  });

  private resizeEvent$ = this.previewing$.pipe(
    filter(() => !this.resizeDisabled),
    switchMap((previewing) => {
      return previewing
        ? this.controller.fromLayoutEvent<MouseEvent>('mousedown')
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

  private collapseAtSize$ = this.resizedSize$.pipe(
    filter((size) => {
      if (size.width !== undefined) {
        return this.resizeCollapseRatio >= size.width / size.rect.width;
      }

      if (size.height !== undefined) {
        return this.resizeCollapseRatio >= size.height / size.rect.height;
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
  @Output() backdropClick = new EventEmitter<void>();

  constructor(
    private bodyListeners: BodyListeners,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(DOCUMENT)
    private document: Document,
    protected override elementRef: ElementRef<HTMLElement>,
    protected override controllerFactory: BergPanelControllerFactory,
    @Inject(BERG_PANEL_INPUTS)
    @Optional()
    protected override inputs: BergPanelInputs
  ) {
    super(inputs, controllerFactory, elementRef);
    this.layoutElement = this.findLayoutElement();
    this.subscribe();

    // Life cycle hooks are bugged out in @angular/elements.
    this.zone.runOutsideAngular(() => {
      Promise.resolve().then(() => {
        this.controller.add(this);
        this.init = true;
      });
    });
  }

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
    this.layoutElement.appendChild(this.getBackdropElement());
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();

    if (this.layoutElement.contains(backdrop)) {
      this.layoutElement.removeChild(backdrop);
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
        .subscribe(() => this.backdropClick.emit());
    }

    return this._backdropElement;
  }

  private subscribeToResize(): void {
    if (this.resizePosition === null) {
      return;
    }

    this.resizing$.pipe(takeUntil(this.destroySub)).subscribe((resizing) => {
      this._resizing = resizing;
      this.changeDetectorRef.markForCheck();
    });

    this.previewing$
      .pipe(
        switchMap((previewing) => {
          return of(previewing).pipe(
            delay(previewing ? this.resizePreviewDelay : 0)
          );
        }),
        takeUntil(this.destroySub)
      )
      .subscribe((previewing) => {
        this._previewing = previewing;
        this.changeDetectorRef.markForCheck();
      });

    this.resizedSize$
      .pipe(distinctUntilChanged(), takeUntil(this.destroySub))
      .subscribe((size) => {
        this._size = size;
        this.changeDetectorRef.markForCheck();
      });

    merge(fromEvent<DragEvent>(this.hostElem, 'dragstart'))
      .pipe(takeUntil(this.destroySub))
      .subscribe((event) => event.preventDefault());

    this.collapsed$.pipe(takeUntil(this.destroySub)).subscribe((collapsed) => {
      this._resizeCollapsed = collapsed;
      this.changeDetectorRef.markForCheck();
    });

    this.slotSub
      .pipe(
        startWith(this._slot),
        switchMap((slot) => this.controller.getRenderedResizeToggles(slot)),
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

  private subscribe(): void {
    combineLatest([this.previewing$, this.resizing$])
      .pipe(takeUntil(this.destroySub))
      .subscribe(([previewing, resizing]) => {
        const resizeClass =
          this.resizePosition === 'above' || this.resizePosition === 'below'
            ? 'berg-layout-resize-vertical'
            : 'berg-layout-resize-horizontal';

        if (previewing || resizing) {
          this.layoutElement.classList.add(resizeClass);
        } else {
          this.layoutElement.classList.remove(resizeClass);
        }
      });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToResize();
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change['absolute']) {
      this.updateBackdrop();
      this.controller.push();
    }

    if (change['slot']) {
      this.controller.push();
    }

    if (change['collapsed']) {
      if (this.collapsed && !this.init) {
        this._hidden = true;
        return;
      } else {
        this._hidden = false;
      }

      this.updateBackdrop();
      this.controller.push();

      if (this.collapsed) {
        this.collapse();
      } else {
        this.expand();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
    this.controller.remove(this);
  }
}
