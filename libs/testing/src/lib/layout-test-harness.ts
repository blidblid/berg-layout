import {
  BergLayoutElement,
  BergPanelElement,
  BergPanelSlot,
} from '@berg-layout/core';

export class BergLayoutTestHarness {
  get center(): BergPanelElement | null {
    return this.getLayout().querySelector<BergPanelElement>(
      '.berg-panel-center'
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

  constructor(public getLayout: () => BergLayoutElement) {}

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

  getAssertedBackdrop(slot: BergPanelSlot): HTMLElement {
    const backdrop = this.getBackdrop(slot);

    if (!backdrop) {
      throw new Error(`No ${slot} panel backdrop found`);
    }

    return backdrop;
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
}
