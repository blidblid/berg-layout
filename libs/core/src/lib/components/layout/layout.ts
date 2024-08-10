import { fromEvent, merge, Observable } from 'rxjs';
import { coerceBooleanProperty, coerceNumberProperty } from '../../util';
import { BergPanelSlot } from '../panel';
import { BERG_PANEL_RESIZE_TOGGLE_CLASS } from '../panel/panel-config-private';
import { WebComponent } from '../web-component';
import {
  BERG_LAYOUT_ATTRIBUTE_BY_INPUT,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_LAYOUT_INPUT_BY_ATTRIBUTE,
  BERG_LAYOUT_TAG_NAME,
} from './layout-config';
import {
  BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS,
  BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS,
  BERG_LAYOUT_CLASS,
  BERG_LAYOUT_OVERFLOW_X_CLASS,
  BERG_LAYOUT_OVERFLOW_Y_CLASS,
  BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS,
  BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS,
} from './layout-config-private';
import { BergLayoutInputs } from './layout-model';
import {
  validateBergLayoutBottomPosition,
  validateBergLayoutOverflow,
  validateBergLayoutTopPosition,
} from './layout-util-private';

export class BergLayoutElement extends WebComponent<BergLayoutInputs> {
  /** @hidden */
  resizeToggles = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  private sizes: Record<BergPanelSlot, number> = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  private disabledAnimations: Record<BergPanelSlot, boolean> = {
    top: false,
    right: false,
    bottom: false,
    left: false,
  };

  constructor() {
    super(
      BERG_LAYOUT_DEFAULT_INPUTS,
      {
        resizeToggleSize: coerceNumberProperty,
        resizeDisabled: coerceBooleanProperty,
        resizePreviewDelay: coerceNumberProperty,
        resizeTwoDimensions: coerceBooleanProperty,
        topLeftPosition: validateBergLayoutTopPosition,
        topRightPosition: validateBergLayoutTopPosition,
        bottomLeftPosition: validateBergLayoutBottomPosition,
        bottomRightPosition: validateBergLayoutBottomPosition,
        topInset: coerceNumberProperty,
        rightInset: coerceNumberProperty,
        bottomInset: coerceNumberProperty,
        leftInset: coerceNumberProperty,
        contentMinSize: coerceNumberProperty,
        overflow: validateBergLayoutOverflow,
      },
      {
        resizeToggleSize: () => {
          this.style.setProperty(
            '--berg-layout-resize-toggle-size',
            `${this.values.resizeToggleSize}px`
          );
        },
        topLeftPosition: () => {
          if (this.values.topLeftPosition === 'above') {
            this.classList.add(BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS);
          }
        },
        topRightPosition: () => {
          if (this.values.topRightPosition === 'above') {
            this.classList.add(BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS);
          }
        },
        bottomLeftPosition: () => {
          if (this.values.bottomLeftPosition === 'below') {
            this.classList.add(BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS);
          }
        },
        bottomRightPosition: () => {
          if (this.values.bottomRightPosition === 'below') {
            this.classList.add(BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS);
          }
        },
        topInset: () => {
          this.style.setProperty(
            '--berg-layout-top-inset',
            `${this.values.topInset}px`
          );
        },
        rightInset: () => {
          this.style.setProperty(
            '--berg-layout-right-inset',
            `${this.values.rightInset}px`
          );
        },
        bottomInset: () => {
          this.style.setProperty(
            '--berg-layout-bottom-inset',
            `${this.values.bottomInset}px`
          );
        },
        leftInset: () => {
          this.style.setProperty(
            '--berg-layout-left-inset',
            `${this.values.leftInset}px`
          );
        },
        overflow: () => {
          this.classList.remove(
            BERG_LAYOUT_OVERFLOW_X_CLASS,
            BERG_LAYOUT_OVERFLOW_Y_CLASS
          );

          if (this.values.overflow === 'x') {
            this.classList.add(BERG_LAYOUT_OVERFLOW_X_CLASS);
          } else if (this.values.overflow === 'y') {
            this.classList.add(BERG_LAYOUT_OVERFLOW_Y_CLASS);
          } else if (this.values.overflow === 'xy') {
            this.classList.add(BERG_LAYOUT_OVERFLOW_X_CLASS);
            this.classList.add(BERG_LAYOUT_OVERFLOW_Y_CLASS);
          }
        },
      },
      BERG_LAYOUT_INPUT_BY_ATTRIBUTE
    );
  }

  /** @hidden */
  fromResizeTogglesEvent<T extends Event>(
    eventName: string,
    slot: BergPanelSlot
  ): Observable<T> {
    return merge(
      ...this.getAdjacentResizeTogglesForSlot(slot).map((resizeToggle) => {
        return fromEvent<T>(resizeToggle, eventName);
      })
    );
  }

  updateSize(slot: BergPanelSlot, size: number): void {
    this.sizes[slot] = size;
    this.style.setProperty(`--berg-panel-${slot}-size`, `${size}px`);
  }

  updateAbsolute(slot: BergPanelSlot, absolute: boolean): void {
    const className = `berg-layout-${slot}-absolute`;

    if (absolute) {
      this.classList.add(className);
    } else {
      this.classList.remove(className);
    }
  }

  updateCollapsed(slot: BergPanelSlot, collapsed: boolean): void {
    const className = `berg-layout-${slot}-collapsed`;

    if (collapsed) {
      this.classList.add(className);
    } else {
      this.classList.remove(className);
    }
  }

  updateAnimationDisabled(slot: BergPanelSlot, disable: boolean): void {
    this.disabledAnimations[slot] = disable;

    const transitionProperties = [];

    if (!this.disabledAnimations.top) {
      transitionProperties.push('top');
    }

    if (!this.disabledAnimations.right) {
      transitionProperties.push('right');
    }

    if (!this.disabledAnimations.bottom) {
      transitionProperties.push('bottom');
    }

    if (!this.disabledAnimations.left) {
      transitionProperties.push('left');
    }

    this.style.setProperty(
      '--berg-panel-transition-property',
      transitionProperties.join(', ')
    );

    this.style.setProperty(
      '--berg-layout-transition-property',
      transitionProperties.map((property) => `padding-${property}`).join(', ')
    );
  }

  getSlotSize(slot: BergPanelSlot): number {
    return this.sizes[slot];
  }

  getSlotInset(slot: BergPanelSlot): number {
    if (slot === 'top') {
      return this.values.topInset;
    }

    if (slot === 'right') {
      return this.values.rightInset;
    }

    if (slot === 'bottom') {
      return this.values.bottomInset;
    }

    if (slot === 'left') {
      return this.values.leftInset;
    }

    return 0;
  }

  getLayoutWidth() {
    return (
      window.innerHeight -
      this.getSlotInset('top') -
      this.getSlotInset('bottom')
    );
  }

  getLayoutHeight() {
    return (
      window.innerWidth - this.getSlotInset('right') - this.getSlotInset('left')
    );
  }

  protected getDefaultInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return BERG_LAYOUT_DEFAULT_INPUTS[input];
  }

  private setInitialVariables(): void {
    for (const slot of ['top', 'right', 'bottom', 'left'] as const) {
      this.updateSize(slot, 0);
    }
  }

  private getAdjacentResizeTogglesForSlot(slot: BergPanelSlot): HTMLElement[] {
    if (slot === 'top') {
      return [
        this.resizeToggles.top,
        this.resizeToggles.left,
        this.resizeToggles.right,
      ];
    }

    if (slot === 'right') {
      return [
        this.resizeToggles.right,
        this.resizeToggles.bottom,
        this.resizeToggles.top,
      ];
    }

    if (slot === 'bottom') {
      return [
        this.resizeToggles.bottom,
        this.resizeToggles.right,
        this.resizeToggles.left,
      ];
    }

    if (slot === 'left') {
      return [
        this.resizeToggles.left,
        this.resizeToggles.bottom,
        this.resizeToggles.top,
      ];
    }

    return [];
  }

  private createResizeToggleElement(slot: BergPanelSlot): HTMLElement {
    const div = document.createElement('div');

    div.classList.add(
      BERG_PANEL_RESIZE_TOGGLE_CLASS,
      `${BERG_PANEL_RESIZE_TOGGLE_CLASS}-${slot}`
    );

    return div;
  }

  connectedCallback(): void {
    this.classList.add(BERG_LAYOUT_CLASS);
    this.setInitialVariables();

    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <slot name="top"></slot>
      <slot name="right"></slot>
      <slot name="bottom"></slot>
      <slot name="left"></slot>
      <div part="content">
        <div part="overflow">
          <slot name="content"></slot>
        </div>
      </div>
    `;

    this.setAttribute('part', 'layout');
  }

  static get observedAttributes(): string[] {
    return Object.values(BERG_LAYOUT_ATTRIBUTE_BY_INPUT);
  }
}

if (!customElements.get(BERG_LAYOUT_TAG_NAME)) {
  customElements.define(BERG_LAYOUT_TAG_NAME, BergLayoutElement);
}
