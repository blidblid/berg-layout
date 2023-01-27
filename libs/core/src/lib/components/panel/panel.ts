import {
  coerceBooleanProperty,
  coerceNumberProperty,
} from '@angular/cdk/coercion';
import {
  animationFrameScheduler,
  combineLatest,
  EMPTY,
  fromEvent,
  merge,
  of,
} from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  share,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { BergLayout } from '../layout';
import { BERG_LAYOUT_TAG_NAME } from '../layout/layout-config-private';
import { WebComponent } from '../web-component';
import {
  BERG_PANEL_ABSOLUTE_CLASS,
  BERG_PANEL_CLASS,
  BERG_PANEL_CLASSES_BY_SLOT,
  BERG_PANEL_COLLAPSED_CLASS,
  BERG_PANEL_ENABLE_ANIMATION_DELAY,
  BERG_PANEL_HORIZONTAL_CLASS,
  BERG_PANEL_NO_TRANSITION_CLASS,
  BERG_PANEL_PREVIEWING_CLASS,
  BERG_PANEL_RESIZE_DISABLED_CLASS,
  BERG_PANEL_RESIZING_CLASS,
  BERG_PANEL_TAG_NAME,
  BERG_PANEL_VERTICAL_CLASS,
} from './panel-config-private';
import {
  BergPanelAttributes,
  BergPanelResizeEvent,
  BERG_PANEL_DEFAULTS,
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
import { validateOutputBindingMode, validateSlot } from './panel-util-private';

export class BergPanel extends WebComponent<BergPanelAttributes> {
  private backdropElement: HTMLElement;
  private layout: BergLayout;

  private resizeToggle$ = this.changes['slot'].pipe(
    map((slot) => {
      return slot === 'center' ? null : this.layout.resizeToggles[slot];
    })
  );

  private previewing$ = combineLatest([
    this.changes['slot'],
    this.changes['resize-disabled'],
  ]).pipe(
    switchMap(([slot, resizeDisabled]) => {
      if (resizeDisabled) {
        return of(false);
      }

      return merge(
        this.layout.fromResizeTogglesEvent<MouseEvent>('mousemove', slot).pipe(
          withLatestFrom(this.resizeToggle$),
          map(([event, resizeToggle]) => {
            return this.checkResizeThreshold(event, resizeToggle);
          })
        ),
        this.layout
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
        delay(previewing ? this.layout.values['resize-preview-delay'] : 0)
      );
    })
  );

  private startResizeEvent = this.previewing$.pipe(
    switchMap((previewing) => {
      return previewing
        ? fromEvent<MouseEvent>(this.layout, 'mousedown')
        : EMPTY;
    })
  );

  private stopResizeEvent$ = merge(
    fromEvent<MouseEvent>(document.documentElement, 'mouseup'),
    fromEvent<MouseEvent>(document.documentElement, 'mouseleave')
  );

  private resizing$ = merge(
    this.startResizeEvent.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(share(), startWith(false), distinctUntilChanged());

  private resizeEvent$ = this.startResizeEvent.pipe(
    switchMap(() =>
      fromEvent<MouseEvent>(this.layout, 'mousemove').pipe(
        takeUntil(this.stopResizeEvent$)
      )
    ),
    debounceTime(0, animationFrameScheduler),
    map((event) => this.createResizeEvent(event)),
    share()
  );

  constructor() {
    super(
      BERG_PANEL_DEFAULTS,
      {
        slot: (value: string) => validateSlot(value),
        size: coerceNumberProperty,
        absolute: coerceBooleanProperty,
        collapsed: coerceBooleanProperty,
        'resize-disabled': coerceBooleanProperty,
        'min-size': coerceNumberProperty,
        'max-size': coerceNumberProperty,
        'output-binding-mode': (value: string) =>
          validateOutputBindingMode(value),
      },
      {
        absolute: () => {
          this.updateBackdrop();
          this.layout.updateAbsolute(
            this.values['slot'],
            this.values['absolute']
          );

          if (this.values['absolute']) {
            this.classList.add(BERG_PANEL_ABSOLUTE_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_ABSOLUTE_CLASS);
          }
        },
        collapsed: () => {
          this.updateBackdrop();
          this.layout.updateCollapsed(
            this.values['slot'],
            this.values['collapsed']
          );

          if (this.values['collapsed']) {
            this.classList.add(BERG_PANEL_COLLAPSED_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_COLLAPSED_CLASS);
          }
        },
        size: () => this.updateSize(this.values['size']),
        slot: () => {
          this.classList.remove(...Object.values(BERG_PANEL_CLASSES_BY_SLOT));
          this.classList.add(BERG_PANEL_CLASSES_BY_SLOT[this.values['slot']]);

          if (
            this.values['slot'] === 'left' ||
            this.values['slot'] === 'right'
          ) {
            this.classList.add(BERG_PANEL_VERTICAL_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_VERTICAL_CLASS);
          }

          if (
            this.values['slot'] === 'top' ||
            this.values['slot'] === 'bottom'
          ) {
            this.classList.add(BERG_PANEL_HORIZONTAL_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_HORIZONTAL_CLASS);
          }
        },
        'resize-disabled': () => {
          if (this.values['resize-disabled']) {
            this.classList.add(BERG_PANEL_RESIZE_DISABLED_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_RESIZE_DISABLED_CLASS);
          }
        },
      }
    );
  }

  private showBackdrop(): void {
    const backdrop = this.getBackdropElement();
    this.layout.appendChild(backdrop);
    requestAnimationFrame(() => (backdrop.style.opacity = '1'));
    this.backdropElement.style.pointerEvents = 'auto';
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();

    if (this.layout.contains(backdrop)) {
      this.backdropElement.style.opacity = '0';
      this.backdropElement.style.pointerEvents = 'none';

      setTimeout(
        () => this.layout.removeChild(backdrop),
        BACKDROP_ANIMATION_DURATION
      );
    }
  }

  private updateBackdrop(): void {
    if (this.values['absolute'] && !this.values['collapsed']) {
      this.showBackdrop();
    } else {
      this.hideBackdrop();
    }
  }

  private getBackdropElement(): HTMLElement {
    if (!this.backdropElement) {
      this.backdropElement = document.createElement('div');
      this.backdropElement.classList.add('berg-panel-backdrop');
      this.backdropElement.style.transition = `opacity ${BACKDROP_ANIMATION_DURATION}ms ease-in`;
      this.backdropElement.style.zIndex = BACKDROP_Z_INDEX.toString();
      this.backdropElement.style.position = 'fixed';
      this.backdropElement.style.cursor = 'pointer';
      this.backdropElement.style.opacity = '0';
      this.backdropElement.style.top = 'var(--berg-layout-top-inset)';
      this.backdropElement.style.right = 'var(--berg-layout-right-inset)';
      this.backdropElement.style.bottom = 'var(--berg-layout-bottom-inset)';
      this.backdropElement.style.left = 'var(--berg-layout-left-inset)';

      // non-standard property to disable tap highlights
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.backdropElement.style as any).webkitTapHighlightColor =
        'rgba(0, 0, 0, 0)';

      fromEvent<MouseEvent>(this.backdropElement, 'click')
        .pipe(takeUntil(this.disconnectedSub))
        .subscribe((event) => {
          this.dispatchEvent(
            new CustomEvent('backdropClicked', { detail: event })
          );

          this.updateBindings('onBackdropClicked', event);
        });
    }

    return this.backdropElement;
  }

  private temporarilyDisableTransitions(): void {
    requestAnimationFrame(() => {
      this.classList.add(BERG_PANEL_NO_TRANSITION_CLASS);

      requestIdleCallback(() => {
        this.classList.remove(BERG_PANEL_NO_TRANSITION_CLASS);
      });

      // use a timeout as a fallback if the browser never idles
      setTimeout(
        () => this.classList.remove(BERG_PANEL_NO_TRANSITION_CLASS),
        BERG_PANEL_ENABLE_ANIMATION_DELAY
      );
    });
  }

  private subscribeToResizing(): void {
    if (this.slot === 'center') {
      return;
    }

    this.resizing$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe((resizing) => {
        if (resizing) {
          this.classList.add(BERG_PANEL_RESIZING_CLASS);
        } else {
          this.classList.remove(BERG_PANEL_RESIZING_CLASS);
        }
      });

    this.delayedPreviewing$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe((previewing) => {
        if (previewing) {
          this.classList.add(BERG_PANEL_PREVIEWING_CLASS);
        } else {
          this.classList.remove(BERG_PANEL_PREVIEWING_CLASS);
        }
      });

    this.resizeEvent$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe((resizedSize) => {
        this.updateSize(resizedSize.size);

        this.dispatchEvent(
          new CustomEvent('resized', {
            detail: resizedSize,
          })
        );
      });

    combineLatest([this.previewing$, this.resizing$])
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe(([previewing, resizing]) => {
        const resizeClass = 'berg-layout-resizing';
        const directionalResizeClass =
          this.slot === 'bottom' || this.slot === 'top'
            ? 'berg-layout-resizing-vertical'
            : 'berg-layout-resizing-horizontal';

        if (previewing || resizing) {
          this.layout.classList.add(directionalResizeClass, resizeClass);
        } else {
          this.layout.classList.remove(directionalResizeClass, resizeClass);
        }
      });

    combineLatest([this.changes['slot'], this.changes['resize-disabled']])
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe(([slot, resizeDisabled]) => {
        if (slot === 'center') {
          return;
        }

        if (resizeDisabled) {
          this.removeChild(this.layout.resizeToggles[slot]);
        } else {
          this.appendChild(this.layout.resizeToggles[slot]);
        }
      });
  }

  private createResizeEvent(event: MouseEvent): BergPanelResizeEvent {
    const create = (size: number) => {
      return {
        event,
        size: Math.max(size),
      };
    };

    const inset = this.layout.getSlotInset(this.values['slot']);

    if (this.slot === 'top') {
      return create(event.pageY - inset - document.documentElement.scrollTop);
    }

    if (this.slot === 'left') {
      return create(event.pageX - inset - document.documentElement.scrollLeft);
    }

    if (this.slot === 'bottom') {
      return create(
        document.documentElement.scrollTop +
          window.innerHeight -
          inset -
          event.pageY
      );
    }

    if (this.slot === 'right') {
      return create(
        document.documentElement.scrollLeft +
          window.innerWidth -
          inset -
          event.pageX
      );
    }

    return create(0);
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

    if (!this.layout.values['resize-two-dimensions']) {
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

  private findLayoutElement(): BergLayout {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let elem: HTMLElement | null = this;

    const layoutTagName = BERG_LAYOUT_TAG_NAME.toUpperCase();

    while (elem) {
      if (elem.tagName === layoutTagName) {
        return elem as BergLayout;
      }

      elem = elem.parentElement;
    }

    throw new Error(
      `<${BERG_PANEL_TAG_NAME}> could not find a parent <${BERG_LAYOUT_TAG_NAME}> element`
    );
  }

  private updateBindings<T extends keyof BergPanelOutputBinding>(
    binding: T,
    ...params: Parameters<BergPanelOutputBinding[T]>
  ): void {
    const updates = BERG_PANEL_OUTPUT_BINDINGS[
      this.values['output-binding-mode']
    ][
      binding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ](...(params as [any]));

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this[key as keyof this] = value as any;

      if (key === 'collapsed') {
        this.updateBackdrop();
      }
    }
  }

  private updateSize(size: number): void {
    if (this.values['min-size'] && size < this.values['min-size']) {
      size = this.values['min-size'];
    }

    if (this.values['max-size'] && size > this.values['max-size']) {
      size = this.values['max-size'];
    }

    this.layout.updateSizeCssVariable(this.values['slot'], size);
  }

  override connectedCallback(): void {
    this.temporarilyDisableTransitions();
    this.layout = this.findLayoutElement();

    super.connectedCallback();

    this.classList.add(BERG_PANEL_CLASS);
    this.subscribeToResizing();

    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        .berg-panel-overflow {
          overflow: auto;
          height: 100%;
          width: 100%;
        }

        .berg-panel-center .berg-panel-overflow {
          overflow: visible;
        }

        .berg-panel-content {
          box-sizing: border-box;
        }
      </style>

      <div class="berg-panel-overflow"
          part="overflow">
        <div class="berg-panel-content"
              part="content">
          <slot></slot>
        </div>
      </div>`;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.layout.updateSizeCssVariable(this.values['slot'], 0);
  }

  static get observedAttributes(): (keyof BergPanelAttributes)[] {
    return Object.keys(BERG_PANEL_DEFAULTS) as (keyof BergPanelAttributes)[];
  }
}

try {
  customElements.define(BERG_PANEL_TAG_NAME, BergPanel);
} catch (e) {
  console.warn(`${BERG_PANEL_TAG_NAME} is already defined as a web component.`);
  throw e;
}
