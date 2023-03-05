import {
  BergLayoutElement,
  BergPanelElement,
  BergPanelSlot,
} from '@berg-layout/core';

export class BergLayoutTestHarness {
  get center(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>(
      '.berg-layout [slot="content"]'
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

  get assertedCenter(): BergPanelElement {
    const center = this.center;

    if (!center) {
      throw new Error('No center panel found');
    }

    return center;
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
      this.assertedCenter,
      this.assertedTop,
      this.assertedRight,
      this.assertedBottom,
      this.assertedLeft,
    ];
  }

  constructor(public getLayout: () => BergLayoutElement) {}

  previewResize(slot: BergPanelSlot): void {
    const resizeToggle = this.getResizeToggle(slot);
    resizeToggle.dispatchEvent(new MouseEvent('mousemove'));
  }

  async resize(slot: BergPanelSlot, size: number): Promise<void> {
    this.previewResize(slot);

    document.documentElement.dispatchEvent(new MouseEvent('mousedown'));

    let clientXY = size;

    if (slot === 'right') {
      clientXY = window.innerWidth - size;
    }

    if (slot === 'bottom') {
      clientXY = window.innerHeight - size;
    }

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: clientXY,
      clientY: clientXY,
    });

    document.documentElement.dispatchEvent(mouseMoveEvent);

    await this.tickAnimationFrame();

    document.documentElement.dispatchEvent(new MouseEvent('mouseup'));
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

  getResizeToggle(slot: BergPanelSlot): HTMLElement {
    const resizeToggle = this.getAssertedPanel(slot).querySelector<HTMLElement>(
      '.berg-panel-resize-toggle'
    );

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

  private getLayoutShadowRoot(): ShadowRoot {
    const shadowRoot = this.getLayout().shadowRoot;

    if (!shadowRoot) {
      throw new Error('Layout has no shadow root');
    }

    return shadowRoot;
  }

  private getAssertedPanel(slot: BergPanelSlot): BergPanelElement {
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
}
