import {
  animationFrameScheduler,
  combineLatest,
  defer,
  EMPTY,
  fromEvent,
  merge,
  of,
  skip,
  timer,
} from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  map,
  pairwise,
  share,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { coerceBooleanProperty, coerceNumberProperty } from '../../util';
import { BergLayoutElement, BERG_LAYOUT_TAG_NAME } from '../layout';
import {
  BERG_LAYOUT_NO_TRANSITION_CLASS,
  BERG_LAYOUT_RESIZING_HORIZONTAL_CLASS,
  BERG_LAYOUT_RESIZING_VERTICAL_CLASS,
} from '../layout/layout-config-private';
import { WebComponent } from '../web-component';
import {
  BERG_PANEL_ATTRIBUTE_BY_INPUT,
  BERG_PANEL_DEFAULT_INPUTS,
  BERG_PANEL_INPUT_BY_ATTRIBUTE,
  BERG_PANEL_TAG_NAME,
} from './panel-config';
import {
  BERG_PANEL_ABSOLUTE_CLASS,
  BERG_PANEL_ANIMATION_DURATION,
  BERG_PANEL_BACKDROP_ANIMATION_DURATION,
  BERG_PANEL_BACKDROP_Z_INDEX,
  BERG_PANEL_CLASS,
  BERG_PANEL_CLASSES_BY_SLOT,
  BERG_PANEL_COLLAPSED_CLASS,
  BERG_PANEL_ENABLE_ANIMATION_DELAY,
  BERG_PANEL_HORIZONTAL_CLASS,
  BERG_PANEL_NO_TRANSITION_CLASS,
  BERG_PANEL_PREVIEWING_CLASS,
  BERG_PANEL_RESIZE_DISABLED_CLASS,
  BERG_PANEL_RESIZING_CLASS,
  BERG_PANEL_SLOT_SIBLINGS,
  BERG_PANEL_TWO_DIMENSION_COLLECTION_DISTANCE,
  BERG_PANEL_VERTICAL_CLASS,
} from './panel-config-private';
import { BergPanelInputs, BergPanelResizeEvent } from './panel-model';
import {
  BergPanelEventBinding,
  BERG_PANEL_EVENT_BINDINGS,
} from './panel-output-bindings';
import { validateOutputBindingMode, validateSlot } from './panel-util-private';

export class BergPanelElement extends WebComponent<BergPanelInputs> {
  private backdropElement: HTMLElement;
  private layout = new BergLayoutElement();

  private timeouts: ReturnType<typeof setTimeout>[] = [];

  private canResize = (_: number) => true;

  private get isVertical() {
    return this.values.slot === 'bottom' || this.values.slot === 'top';
  }

  private resizeToggle$ = this.changes.slot.pipe(
    map((slot) => this.layout.resizeToggles[slot])
  );

  private resizeDisabled$ = combineLatest([
    this.changes.resizeDisabled,
    defer(() => this.layout.changes.resizeDisabled),
  ]).pipe(
    map(([resizeDisabled, layoutResizeDisabled]) => {
      return resizeDisabled || layoutResizeDisabled;
    })
  );

  private previewing$ = combineLatest([
    this.changes.slot,
    this.resizeDisabled$,
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
        delay(previewing ? this.layout.values.resizePreviewDelay : 0)
      );
    })
  );

  private startResizeEvent$ = this.previewing$.pipe(
    switchMap((previewing) => {
      return previewing
        ? fromEvent<MouseEvent>(document.documentElement, 'mousedown')
        : EMPTY;
    })
  );

  private stopResizeEvent$ = merge(
    fromEvent<MouseEvent>(document.documentElement, 'mouseup'),
    fromEvent<MouseEvent>(document.documentElement, 'mouseleave')
  );

  private resizing$ = merge(
    this.startResizeEvent$.pipe(map(() => true)),
    this.stopResizeEvent$.pipe(map(() => false))
  ).pipe(share(), startWith(false), distinctUntilChanged());

  private resizeEvent$ = this.startResizeEvent$.pipe(
    switchMap(() =>
      fromEvent<MouseEvent>(document.documentElement, 'mousemove').pipe(
        takeUntil(this.stopResizeEvent$)
      )
    ),
    debounceTime(0, animationFrameScheduler),
    map((event) => this.createResizeEvent(event)),
    share()
  );

  private collapsedAnimationEnd$ = this.attributeChanges$.pipe(
    // skip to avoid the replayed value
    switchMap(() => this.changes.collapsed.pipe(skip(1))),
    withLatestFrom(this.resizing$),
    switchMap(([_, resizing]) => {
      return timer(resizing ? 0 : BERG_PANEL_ANIMATION_DURATION).pipe(
        takeUntil(this.changes.collapsed.pipe(skip(1)))
      );
    })
  );

  constructor() {
    super(
      BERG_PANEL_DEFAULT_INPUTS,
      {
        slot: (value: string) => validateSlot(value),
        size: coerceNumberProperty,
        absolute: coerceBooleanProperty,
        collapsed: coerceBooleanProperty,
        resizeDisabled: coerceBooleanProperty,
        minSize: coerceNumberProperty,
        maxSize: coerceNumberProperty,
        animationDisabled: coerceBooleanProperty,
        hideBackdrop: coerceBooleanProperty,
        eventBindingMode: (value: string) => validateOutputBindingMode(value),
      },
      {
        absolute: () => {
          this.updateBackdrop();
          this.layout.updateAbsolute(this.values.slot, this.values.absolute);
          const absoluteZIndex = (BERG_PANEL_BACKDROP_Z_INDEX + 1).toString();

          if (this.values.absolute) {
            // the z-index is animated despite not being a transitioned property,
            // update z-index with disabled transitions to avoid flickering
            this.disableTransitions();
            this.style.setProperty('z-index', absoluteZIndex);

            requestAnimationFrame(() => {
              this.enableTransitions();
              this.classList.add(BERG_PANEL_ABSOLUTE_CLASS);
            });
          } else {
            this.classList.remove(BERG_PANEL_ABSOLUTE_CLASS);

            if (this.style.zIndex === absoluteZIndex) {
              this.timeouts.push(
                setTimeout(() => {
                  this.style.removeProperty('z-index');
                }, BERG_PANEL_BACKDROP_ANIMATION_DURATION)
              );
            }
          }
        },
        collapsed: () => {
          this.updateBackdrop();
          this.layout.updateCollapsed(this.values.slot, this.values.collapsed);

          if (this.values.collapsed) {
            this.classList.add(BERG_PANEL_COLLAPSED_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_COLLAPSED_CLASS);
          }
        },
        size: () => this.updateSize(this.values['size']),
        minSize: () => this.updateSize(this.values['size']),
        maxSize: () => this.updateSize(this.values['size']),
        animationDisabled: () => {
          this.layout.updateAnimationDisabled(
            this.values.slot,
            this.values.animationDisabled
          );

          if (this.values.animationDisabled) {
            this.classList.add(BERG_PANEL_NO_TRANSITION_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_NO_TRANSITION_CLASS);
          }
        },
        hideBackdrop: () => this.updateBackdrop(),
        slot: () => {
          this.classList.remove(...Object.values(BERG_PANEL_CLASSES_BY_SLOT));
          this.classList.add(BERG_PANEL_CLASSES_BY_SLOT[this.values.slot]);
          this.setAttribute('part', this.values.slot);

          if (!this.isVertical) {
            this.classList.add(BERG_PANEL_VERTICAL_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_VERTICAL_CLASS);
          }

          if (this.isVertical) {
            this.classList.add(BERG_PANEL_HORIZONTAL_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_HORIZONTAL_CLASS);
          }
        },
        resizeDisabled: () => {
          if (this.values.resizeDisabled) {
            this.classList.add(BERG_PANEL_RESIZE_DISABLED_CLASS);
          } else {
            this.classList.remove(BERG_PANEL_RESIZE_DISABLED_CLASS);
          }
        },
      },
      BERG_PANEL_INPUT_BY_ATTRIBUTE
    );
  }

  private showBackdrop(): void {
    if (this.values.hideBackdrop) {
      return;
    }

    const backdrop = this.getBackdropElement();

    if (!this.layout.shadowRoot || this.layout.shadowRoot.contains(backdrop)) {
      return;
    }

    this.layout.shadowRoot.appendChild(backdrop);

    if (this.values.animationDisabled) {
      backdrop.style.opacity = '1';
    } else {
      requestAnimationFrame(() => (backdrop.style.opacity = '1'));
    }

    this.backdropElement.style.pointerEvents = 'auto';
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();

    if (!this.layout.shadowRoot || !this.layout.shadowRoot.contains(backdrop)) {
      return;
    }

    this.backdropElement.style.opacity = '0';
    this.backdropElement.style.pointerEvents = 'none';

    if (this.values.animationDisabled) {
      this.layout.shadowRoot.removeChild(backdrop);
    } else {
      this.timeouts.push(
        setTimeout(() => {
          this.layout.shadowRoot?.removeChild(backdrop);
        }, BERG_PANEL_BACKDROP_ANIMATION_DURATION)
      );
    }
  }

  private updateBackdrop(): void {
    if (this.values.absolute && !this.values.collapsed) {
      this.showBackdrop();
    } else {
      this.hideBackdrop();
    }
  }

  private getBackdropElement(): HTMLElement {
    if (!this.backdropElement) {
      this.backdropElement = document.createElement('div');
      this.backdropElement.classList.add('berg-panel-backdrop');
      this.backdropElement.classList.add(
        `berg-panel-${this.values.slot}-backdrop`
      );

      const style = this.backdropElement.style;
      style.transition = `opacity ${BERG_PANEL_BACKDROP_ANIMATION_DURATION}ms ease-in`;
      style.zIndex = BERG_PANEL_BACKDROP_Z_INDEX.toString();
      style.position = 'fixed';
      style.cursor = 'pointer';
      style.opacity = '0';
      style.top = 'var(--berg-layout-top-inset)';
      style.right = 'var(--berg-layout-right-inset)';
      style.bottom = 'var(--berg-layout-bottom-inset)';
      style.left = 'var(--berg-layout-left-inset)';
      style.background = 'var(--berg-panel-backdrop-background)';

      // non-standard property to disable tap highlights
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (style as any).webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';

      fromEvent<MouseEvent>(this.backdropElement, 'click')
        .pipe(takeUntil(this.disconnectedSub))
        .subscribe((event) => {
          if (!this.values.absolute) {
            return;
          }

          this.dispatchEvent(
            new CustomEvent('backdropClicked', { detail: event })
          );

          this.updateEventBindings('onBackdropClicked', event);
        });
    }

    return this.backdropElement;
  }

  private disableTransitions(): void {
    this.layout.classList.add(BERG_LAYOUT_NO_TRANSITION_CLASS);
  }

  private enableTransitions(): void {
    this.layout.classList.remove(BERG_LAYOUT_NO_TRANSITION_CLASS);
  }

  private temporarilyDisableTransitions(): void {
    requestAnimationFrame(() => {
      this.disableTransitions();

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.enableTransitions();
        });
      }

      // use a timeout as a fallback if the browser never idles
      this.timeouts.push(
        setTimeout(
          () => this.enableTransitions(),
          BERG_PANEL_ENABLE_ANIMATION_DELAY
        )
      );
    });
  }

  private subscribeToCollapsed(): void {
    this.collapsedAnimationEnd$
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe(() => {
        if (this.values.collapsed) {
          this.dispatchEvent(new CustomEvent('afterCollapsed'));
        } else {
          this.dispatchEvent(new CustomEvent('afterExpanded'));
        }
      });
  }

  private subscribeToResizing(): void {
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
        if (this.canResize(resizedSize.size)) {
          this.updateSize(resizedSize.size);
        }

        this.updateCanResize(resizedSize.size);

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
        const directionalResizeClass = this.isVertical
          ? BERG_LAYOUT_RESIZING_VERTICAL_CLASS
          : BERG_LAYOUT_RESIZING_HORIZONTAL_CLASS;

        if (previewing || resizing) {
          this.layout.classList.add(directionalResizeClass, resizeClass);
        } else {
          this.layout.classList.remove(directionalResizeClass, resizeClass);
        }
      });

    combineLatest([this.changes.slot.pipe(pairwise()), this.resizeDisabled$])
      .pipe(takeUntil(this.disconnectedSub))
      .subscribe(([[previousSlot, currentSlot], resizeDisabled]) => {
        const currentResizeToggle = this.layout.resizeToggles[currentSlot];

        if (resizeDisabled && this.contains(currentResizeToggle)) {
          this.removeChild(currentResizeToggle);
        } else {
          this.appendChild(currentResizeToggle);
        }

        const previousResizeToggle = this.layout.resizeToggles[previousSlot];

        if (
          previousSlot !== currentSlot &&
          this.contains(previousResizeToggle)
        ) {
          this.removeChild(this.layout.resizeToggles[previousSlot]);
        }
      });
  }

  private updateCanResize(currentSize: number): void {
    // avoid using getBoundingClient, since it has floating accuracy and `currentSize` integer accuracy.
    const size = this.isVertical ? this.offsetHeight : this.offsetWidth;

    this.canResize = (nextSize: number) => {
      const layoutSize = this.isVertical
        ? this.layout.getLayoutWidth()
        : this.layout.getLayoutHeight();

      const siblingSlot = BERG_PANEL_SLOT_SIBLINGS[this.values.slot];
      const siblingSize = this.layout.getSlotSize(siblingSlot);

      const maxSize =
        layoutSize -
        siblingSize -
        this.layout.values.resizeToggleSize -
        this.layout.values.contentMinSize;

      if (nextSize > currentSize && nextSize > maxSize) {
        return false;
      }

      // The resizing worked, allow the next resize event.
      if (currentSize === size) {
        return true;
      }

      // The resizing was too large, only allow smaller resizes.
      if (currentSize > size) {
        return nextSize < size;
      }

      return nextSize > size;
    };
  }

  private createResizeEvent(event: MouseEvent): BergPanelResizeEvent {
    const create = (size: number) => {
      return {
        event,
        size,
      };
    };

    const inset = this.layout.getSlotInset(this.values.slot);

    if (this.slot === 'top') {
      return create(event.clientY - inset);
    }

    if (this.slot === 'left') {
      return create(event.clientX - inset);
    }

    if (this.slot === 'bottom') {
      return create(
        document.documentElement.clientHeight - inset - event.clientY
      );
    }

    if (this.slot === 'right') {
      return create(
        document.documentElement.clientWidth - inset - event.clientX
      );
    }

    return create(0);
  }

  private checkResizeThreshold(
    event: MouseEvent,
    resizeToggle: HTMLElement | null
  ): boolean {
    if (resizeToggle === null) {
      return false;
    }

    if (event.target === resizeToggle) {
      return true;
    }

    if (!this.layout.values.resizeTwoDimensions) {
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

    return (
      BERG_PANEL_TWO_DIMENSION_COLLECTION_DISTANCE > Math.abs(origin - mouse)
    );
  }

  private findLayoutElement(): BergLayoutElement {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let elem: HTMLElement | null = this;

    const layoutTagName = BERG_LAYOUT_TAG_NAME.toUpperCase();

    while (elem) {
      if (elem.tagName === layoutTagName) {
        return elem as BergLayoutElement;
      }

      elem = elem.parentElement;
    }

    throw new Error(
      `<${BERG_PANEL_TAG_NAME}> could not find a parent <${BERG_LAYOUT_TAG_NAME}> element`
    );
  }

  private updateEventBindings<T extends keyof BergPanelEventBinding>(
    binding: T,
    ...params: Parameters<BergPanelEventBinding[T]>
  ): void {
    const updateAttributes = BERG_PANEL_EVENT_BINDINGS[
      this.values.eventBindingMode
    ][
      binding
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ](...(params as [any]));

    for (const [key, attribute] of Object.entries(updateAttributes)) {
      if (attribute === undefined) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.setAttribute(key, `${attribute}`);
    }
  }

  private updateSize(size: number): void {
    if (this.values.minSize && size < this.values.minSize) {
      size = this.values.minSize;
    }

    if (this.values.maxSize && size > this.values.maxSize) {
      size = this.values.maxSize;
    }

    this.layout.updateSize(this.values.slot, size);
  }

  connectedCallback(): void {
    this.layout = this.findLayoutElement();
    this.temporarilyDisableTransitions();

    this.classList.add(BERG_PANEL_CLASS);
    this.subscribeToResizing();
    this.subscribeToCollapsed();

    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        .berg-panel-overflow {
          overflow: auto;
          height: 100%;
          width: 100%;
        }
      </style>

      <div class="berg-panel-overflow" part="overflow">
        <div class="berg-panel-content" part="content">
          <slot></slot>
        </div>
      </div>`;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.layout.updateSize(this.values.slot, 0);

    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }

  static get observedAttributes(): string[] {
    return Object.values(BERG_PANEL_ATTRIBUTE_BY_INPUT);
  }
}

try {
  customElements.define(BERG_PANEL_TAG_NAME, BergPanelElement);
} catch (e) {
  console.warn(`${BERG_PANEL_TAG_NAME} is already defined as a web component.`);
  throw e;
}
