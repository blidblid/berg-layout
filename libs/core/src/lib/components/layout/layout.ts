import { fromEvent, merge, Observable } from 'rxjs';
import { coerceBooleanProperty, coerceNumberProperty } from '../../util';
import { BergPanelSlot } from '../panel';
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
  BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS,
  BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS,
} from './layout-config-private';
import { BergLayoutInputs } from './layout-model';
import {
  validateBergLayoutBottomPosition,
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

  constructor() {
    super(
      BERG_LAYOUT_DEFAULT_INPUTS,
      {
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
      },
      {
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

  updateSizeCssVariable(slot: BergPanelSlot, size: number): void {
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

  protected getDefaultInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return BERG_LAYOUT_DEFAULT_INPUTS[input];
  }

  private setInitialVariables(): void {
    for (const slot of ['top', 'right', 'bottom', 'left'] as const) {
      this.updateSizeCssVariable(slot, 0);
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
      'berg-panel-resize-toggle',
      `berg-panel-resize-toggle-${slot}`
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
      <slot name="center"></slot>
    `;
  }

  static get observedAttributes(): string[] {
    return Object.values(BERG_LAYOUT_ATTRIBUTE_BY_INPUT);
  }
}

try {
  customElements.define(BERG_LAYOUT_TAG_NAME, BergLayoutElement);
} catch (e) {
  console.warn(
    `${BERG_LAYOUT_TAG_NAME} is already defined as a web component.`
  );

  throw e;
}
