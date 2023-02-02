import { fromEvent, merge, Observable } from 'rxjs';
import { coerceBooleanProperty, coerceNumberProperty } from '../../util';
import { BergPanelSlot } from '../panel';
import { WebComponent } from '../web-component';
import { BERG_LAYOUT_DEFAULTS, BERG_LAYOUT_TAG_NAME } from './layout-config';
import {
  BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS,
  BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS,
  BERG_LAYOUT_CLASS,
  BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS,
  BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS,
} from './layout-config-private';
import { BergLayoutAttributes } from './layout-model';
import {
  validateBergLayoutBottomPosition,
  validateBergLayoutTopPosition,
} from './layout-util-private';

export class BergLayoutElement extends WebComponent<BergLayoutAttributes> {
  /** @hidden */
  resizeToggles = {
    top: this.createResizeToggleElement('top'),
    right: this.createResizeToggleElement('right'),
    bottom: this.createResizeToggleElement('bottom'),
    left: this.createResizeToggleElement('left'),
  };

  constructor() {
    super(
      BERG_LAYOUT_DEFAULTS,
      {
        'resize-disabled': coerceBooleanProperty,
        'resize-preview-delay': coerceNumberProperty,
        'resize-two-dimensions': coerceBooleanProperty,
        'top-left-position': validateBergLayoutTopPosition,
        'top-right-position': validateBergLayoutTopPosition,
        'bottom-left-position': validateBergLayoutBottomPosition,
        'bottom-right-position': validateBergLayoutBottomPosition,
        'top-inset': coerceNumberProperty,
        'right-inset': coerceNumberProperty,
        'bottom-inset': coerceNumberProperty,
        'left-inset': coerceNumberProperty,
      },
      {
        'top-left-position': () => {
          if (this.values['top-left-position'] === 'above') {
            this.classList.add(BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_TOP_ABOVE_LEFT_CLASS);
          }
        },
        'top-right-position': () => {
          if (this.values['top-right-position'] === 'above') {
            this.classList.add(BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_TOP_ABOVE_RIGHT_CLASS);
          }
        },
        'bottom-left-position': () => {
          if (this.values['bottom-left-position'] === 'below') {
            this.classList.add(BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_BOTTOM_BELOW_LEFT_CLASS);
          }
        },
        'bottom-right-position': () => {
          if (this.values['bottom-right-position'] === 'below') {
            this.classList.add(BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS);
          } else {
            this.classList.remove(BERG_LAYOUT_BOTTOM_BELOW_RIGHT_CLASS);
          }
        },
        'top-inset': () => {
          this.style.setProperty(
            '--berg-layout-top-inset',
            `${this.values['top-inset']}px`
          );
        },
        'right-inset': () => {
          this.style.setProperty(
            '--berg-layout-right-inset',
            `${this.values['right-inset']}px`
          );
        },
        'bottom-inset': () => {
          this.style.setProperty(
            '--berg-layout-bottom-inset',
            `${this.values['bottom-inset']}px`
          );
        },
        'left-inset': () => {
          this.style.setProperty(
            '--berg-layout-left-inset',
            `${this.values['left-inset']}px`
          );
        },
      }
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
      return this.values['top-inset'];
    }

    if (slot === 'right') {
      return this.values['right-inset'];
    }

    if (slot === 'bottom') {
      return this.values['bottom-inset'];
    }

    if (slot === 'left') {
      return this.values['left-inset'];
    }

    return 0;
  }

  protected getDefaultInput<T extends keyof BergLayoutAttributes>(
    input: T
  ): BergLayoutAttributes[T] {
    return BERG_LAYOUT_DEFAULTS[input];
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

  static get observedAttributes(): (keyof BergLayoutAttributes)[] {
    return Object.keys(BERG_LAYOUT_DEFAULTS) as (keyof BergLayoutAttributes)[];
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
