import {
  BergLayoutElement,
  BergPanelElement,
  BergPanelSlot,
} from '@berg-layout/core';

export class BergLayoutTestHarness {
  get content(): HTMLElement | null {
    return this.getLayout().querySelector<HTMLElement>(
      '.berg-layout [slot="content"]'
    );
  }

  get overflow(): HTMLElement | null {
    return this.getLayoutShadowRoot().querySelector<HTMLElement>(
      '[part="overflow"]'
    );
  }

  get top(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>('.berg-panel-top');
  }

  get right(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>(
      '.berg-panel-right'
    );
  }

  get bottom(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>(
      '.berg-panel-bottom'
    );
  }

  get left(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>('.berg-panel-left');
  }

  get assertedContent(): HTMLElement {
    const content = this.content;

    if (!content) {
      throw new Error('No content found');
    }

    return content;
  }

  get assertedOverflow(): HTMLElement {
    const overflow = this.overflow;

    if (!overflow) {
      throw new Error('No overflow found');
    }

    return overflow;
  }

  get assertedTop(): BergPanelElement {
    const top = this.top;

    if (!top) {
      throw new Error('No top panel found');
    }

    return top;
  }

  get assertedRight(): BergPanelElement {
    const right = this.right;

    if (!right) {
      throw new Error('No right panel found');
    }

    return right;
  }

  get assertedBottom(): BergPanelElement {
    const bottom = this.bottom;

    if (!bottom) {
      throw new Error('No bottom panel found');
    }

    return bottom;
  }

  get assertedLeft(): BergPanelElement {
    const left = this.left;

    if (!left) {
      throw new Error('No left panel found');
    }

    return left;
  }

  get assertedPanels(): BergPanelElement[] {
    return [
      this.assertedTop,
      this.assertedRight,
      this.assertedBottom,
      this.assertedLeft,
    ];
  }

  constructor(public getLayout: () => BergLayoutElement) {}

  previewResize(slot: BergPanelSlot): void {
    const resizeToggle = this.getResizeToggle(slot);

    if (resizeToggle) {
      resizeToggle.dispatchEvent(new MouseEvent('mousemove'));
    }
  }

  async resize(slot: BergPanelSlot, size: number): Promise<void> {
    this.previewResize(slot);

    document.documentElement.dispatchEvent(new MouseEvent('mousedown'));

    let clientXY = size;

    if (slot === 'right') {
      clientXY = document.documentElement.clientWidth - size;
    }

    if (slot === 'bottom') {
      clientXY = document.documentElement.clientHeight - size;
    }

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: clientXY,
      clientY: clientXY,
    });

    document.documentElement.dispatchEvent(mouseMoveEvent);

    await this.tickAnimationFrame();

    document.documentElement.dispatchEvent(new MouseEvent('mouseup'));
  }

  async gesture(
    slot: BergPanelSlot,
    type: 'expand' | 'collapse'
  ): Promise<void> {
    const panel = this.getAssertedPanel(slot);
    const { startX, startY, endX, endY } = this.getGesturePoints(slot, type);

    this.dispatchTouchEvent(panel, 'touchstart', startX, startY);
    this.dispatchTouchEvent(panel, 'touchmove', endX, endY);

    await this.tickAnimationFrame();

    this.dispatchTouchEvent(panel, 'touchend', endX, endY);
  }

  async gestureOutsidePanel(slot: BergPanelSlot): Promise<void> {
    const panel = this.getAssertedPanel(slot);
    const { clientX, clientY } = this.getOutsideGesturePoint(slot);

    this.dispatchTouchEvent(panel, 'touchstart', clientX, clientY);
    this.dispatchTouchEvent(panel, 'touchmove', clientX, clientY);

    await this.tickAnimationFrame();

    this.dispatchTouchEvent(panel, 'touchend', clientX, clientY);
  }

  isPanelCollapsed(slot: BergPanelSlot): boolean {
    return !!this.getLayout().querySelector(
      `.berg-panel-${slot}.berg-panel-collapsed`
    );
  }

  getBackdrop(slot: BergPanelSlot): HTMLElement | null {
    return this.getLayoutShadowRoot().querySelector<HTMLElement>(
      ` .berg-panel-${slot}-backdrop`
    );
  }

  getResizeToggle(slot: BergPanelSlot): HTMLElement | null {
    const resizeToggle = this.getAssertedPanel(slot).querySelector<HTMLElement>(
      '.berg-panel-resize-toggle'
    );

    return resizeToggle;
  }

  getResizeAssertedToggle(slot: BergPanelSlot): HTMLElement {
    const resizeToggle = this.getResizeToggle(slot);

    if (!resizeToggle) {
      throw new Error(`No ${slot} panel resize toggle found`);
    }

    return resizeToggle;
  }

  getAssertedBackdrop(slot: BergPanelSlot): HTMLElement {
    const backdrop = this.getBackdrop(slot);

    if (!backdrop) {
      throw new Error(`No ${slot} panel backdrop found`);
    }

    return backdrop;
  }

  tickAnimationFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  tickDuration(duration = 0): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), duration));
  }

  disableAnimations(): void {
    for (const panel of this.assertedPanels) {
      panel.style.setProperty('transition', 'none');
    }
  }

  enableAnimations(): void {
    for (const panel of this.assertedPanels) {
      panel.style.removeProperty('transition');
    }
  }

  async clickBackdrop(slot: BergPanelSlot): Promise<void> {
    this.getAssertedBackdrop(slot).click();
    return Promise.resolve();
  }

  getLayoutShadowRoot(): ShadowRoot {
    const shadowRoot = this.getLayout().shadowRoot;

    if (!shadowRoot) {
      throw new Error('Layout has no shadow root');
    }

    return shadowRoot;
  }

  getAssertedPanel(slot: BergPanelSlot): BergPanelElement {
    if (slot === 'top') {
      return this.assertedTop;
    }

    if (slot === 'right') {
      return this.assertedRight;
    }

    if (slot === 'bottom') {
      return this.assertedBottom;
    }

    return this.assertedLeft;
  }

  private dispatchTouchEvent(
    target: EventTarget,
    type: 'touchstart' | 'touchmove' | 'touchend',
    clientX: number,
    clientY: number
  ): void {
    const touch = {
      clientX,
      clientY,
      pageX: clientX,
      pageY: clientY,
      screenX: clientX,
      screenY: clientY,
      identifier: 1,
      target,
    } as Touch;

    const event = new Event(type, {
      bubbles: true,
      cancelable: true,
    }) as TouchEvent;

    const touches = type === 'touchend' ? [] : [touch];

    Object.defineProperty(event, 'touches', {
      value: touches,
      configurable: true,
    });

    Object.defineProperty(event, 'targetTouches', {
      value: touches,
      configurable: true,
    });

    Object.defineProperty(event, 'changedTouches', {
      value: [touch],
      configurable: true,
    });

    target.dispatchEvent(event);
  }

  private getGesturePoints(
    slot: BergPanelSlot,
    type: 'expand' | 'collapse'
  ): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } {
    const gestureDistance = 60;
    const edgeOffset = 10;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const topInset = this.getLayoutInset('top');
    const rightInset = this.getLayoutInset('right');
    const bottomInset = this.getLayoutInset('bottom');
    const leftInset = this.getLayoutInset('left');

    if (slot === 'top') {
      const startX = width / 2;
      const startY = topInset + edgeOffset;

      return {
        startX,
        startY,
        endX: startX,
        endY:
          type === 'expand'
            ? startY + gestureDistance
            : startY - gestureDistance,
      };
    }

    if (slot === 'right') {
      const startX = width - rightInset - edgeOffset;
      const startY = height / 2;

      return {
        startX,
        startY,
        endX:
          type === 'expand'
            ? startX - gestureDistance
            : startX + gestureDistance,
        endY: startY,
      };
    }

    if (slot === 'bottom') {
      const startX = width / 2;
      const startY = height - bottomInset - edgeOffset;

      return {
        startX,
        startY,
        endX: startX,
        endY:
          type === 'expand'
            ? startY - gestureDistance
            : startY + gestureDistance,
      };
    }

    const startX = leftInset + edgeOffset;
    const startY = height / 2;

    return {
      startX,
      startY,
      endX:
        type === 'expand' ? startX + gestureDistance : startX - gestureDistance,
      endY: startY,
    };
  }

  private getOutsideGesturePoint(slot: BergPanelSlot): {
    clientX: number;
    clientY: number;
  } {
    const panel = this.getAssertedPanel(slot);
    const edgeOffset = this.getPanelGestureZoneSize(slot) + 10;
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const topInset = this.getLayoutInset('top');
    const rightInset = this.getLayoutInset('right');
    const bottomInset = this.getLayoutInset('bottom');
    const leftInset = this.getLayoutInset('left');

    if (slot === 'top') {
      return {
        clientX: width / 2,
        clientY: topInset + edgeOffset,
      };
    }

    if (slot === 'right') {
      return {
        clientX: width - rightInset - edgeOffset,
        clientY: height / 2,
      };
    }

    if (slot === 'bottom') {
      return {
        clientX: width / 2,
        clientY: height - bottomInset - edgeOffset,
      };
    }

    return {
      clientX: leftInset + edgeOffset,
      clientY:
        panel.getBoundingClientRect().top +
        panel.getBoundingClientRect().height / 2,
    };
  }

  private getLayoutInset(slot: BergPanelSlot): number {
    const value = getComputedStyle(this.getLayout()).getPropertyValue(
      `--berg-layout-${slot}-inset`
    );

    return parseInt(value || '0', 10) || 0;
  }

  private getPanelGestureZoneSize(slot: BergPanelSlot): number {
    const panel = this.getAssertedPanel(slot).getBoundingClientRect();

    return Math.max(
      slot === 'top' || slot === 'bottom' ? panel.height : panel.width,
      200
    );
  }
}
