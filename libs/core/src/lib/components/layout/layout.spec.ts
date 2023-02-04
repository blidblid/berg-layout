/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BergPanelElement, BergPanelSlot } from '../panel';
import '../panel/panel';
import './layout';
import { BergLayoutElement } from './layout';

describe('LayoutComponent', () => {
  let layout: BergLayoutElement;
  let center: BergPanelElement;
  let top: BergPanelElement;
  let right: BergPanelElement;
  let bottom: BergPanelElement;
  let left: BergPanelElement;

  beforeEach(() => {
    layout = document.createElement(
      'berg-layout-web-component'
    ) as BergLayoutElement;

    center = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;

    top = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;

    right = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;

    bottom = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;

    left = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;

    document.body.appendChild(layout);

    for (const panel of [center, top, right, bottom, left]) {
      layout.appendChild(panel);
    }
  });

  describe('alignment', () => {
    it('should render top panel next to left and right', () => {
      expect(top.getBoundingClientRect().bottom).toBe(
        left.getBoundingClientRect().top
      );

      expect(top.getBoundingClientRect().bottom).toBe(
        right.getBoundingClientRect().top
      );
    });

    it('should render right panel next to top and bottom', () => {
      expect(right.getBoundingClientRect().top).toBe(
        top.getBoundingClientRect().bottom
      );

      expect(right.getBoundingClientRect().bottom).toBe(
        bottom.getBoundingClientRect().top
      );
    });

    it('should render bottom panel next to left and right', () => {
      expect(bottom.getBoundingClientRect().top).toBe(
        left.getBoundingClientRect().bottom
      );

      expect(bottom.getBoundingClientRect().top).toBe(
        right.getBoundingClientRect().bottom
      );
    });

    it('should render left panel next to top and bottom', () => {
      expect(left.getBoundingClientRect().top).toBe(
        top.getBoundingClientRect().bottom
      );

      expect(left.getBoundingClientRect().bottom).toBe(
        bottom.getBoundingClientRect().top
      );
    });
  });

  describe('with absolute an panel', () => {
    it('should create a backdrop that covers the layout', () => {
      top.setAttribute('absolute', 'true');
      expect(layout.getBoundingClientRect()).toEqual(
        getBackdrop().getBoundingClientRect()
      );
    });

    it('should position top over center', () => {
      top.setAttribute('absolute', 'true');
      expect(getComputedStyle(center).paddingTop).toBe('0px');
    });

    it('should position right over center', () => {
      right.setAttribute('absolute', 'true');
      expect(getComputedStyle(center).paddingRight).toBe('0px');
    });

    it('should position bottom over center', () => {
      bottom.setAttribute('absolute', 'true');
      expect(getComputedStyle(center).paddingBottom).toBe('0px');
    });

    it('should position left over center', () => {
      left.setAttribute('absolute', 'true');
      expect(getComputedStyle(center).paddingLeft).toBe('0px');
    });

    it('should emit backdropClicked event when clicking backdrop.', () => {
      left.setAttribute('absolute', 'true');
      let clicked = false;

      const backdrop = getBackdrop();

      backdrop.addEventListener('click', () => (clicked = true));
      backdrop.click();

      expect(clicked).toEqual(true);
    });

    it('should close the panel when clicking the backdrop in "auto"-binding mode.', () => {
      left.setAttribute('absolute', 'true');

      getBackdrop().click();

      expect(checkIfPanelIsCollapsed('left')).toBe(true);
    });

    it('should not close the panel when clicking the backdrop in "none"-binding mode.', () => {
      left.setAttribute('absolute', 'true');
      left.setAttribute('event-binding-mode', 'none');

      getBackdrop().click();

      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });
  });

  describe('with a collapsed panel', () => {
    it('should not be collapsed initially', () => {
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });

    it('should start collapsed when using the collapsed attribute', () => {
      left.setAttribute('collapsed', 'true');

      expect(checkIfPanelIsCollapsed('left')).toBe(true);
    });

    it('should start expanding when setting the collapsed attribute to false', () => {
      left.setAttribute('collapsed', 'true');

      left.setAttribute('collapsed', 'false');

      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });

    it('should start expanding when setting the collapsed attribute to false', () => {
      left.setAttribute('collapsed', 'true');

      left.setAttribute('collapsed', 'false');

      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });
  });

  const REQUEST_ANIMATION_FRAME_TICK = 16;

  function checkIfPanelIsCollapsed(slot: BergPanelSlot): boolean {
    return !!layout.querySelector(`.berg-panel-${slot}.berg-panel-collapsed`);
  }

  function getBackdrop(): HTMLElement {
    const backdrop = layout.shadowRoot!.querySelector(
      '.berg-panel-backdrop'
    ) as HTMLElement;

    expect(backdrop).toBeTruthy();
    return backdrop;
  }
});
