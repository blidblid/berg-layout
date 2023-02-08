/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  BergLayoutAttribute,
  BergLayoutAttributes,
  BergPanelAttribute,
  BergPanelAttributes,
  BergPanelSlot,
} from '@berg-layout/core';
import { BergLayoutTestHarness } from './layout-test-harness';

export const runLayoutTests = (
  harness: BergLayoutTestHarness,
  setLayoutAttribute: <T extends BergLayoutAttribute>(
    attribute: T,
    value: BergLayoutAttributes[T]
  ) => Promise<unknown>,
  setPanelAttribute: <T extends BergPanelAttribute>(
    slot: BergPanelSlot,
    attribute: T,
    value: BergPanelAttributes[T]
  ) => Promise<unknown>
) => {
  describe('berg layout', () => {
    describe('alignment', () => {
      it('should render top panel next to left and right', () => {
        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedLeft.getBoundingClientRect().top
        );

        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedRight.getBoundingClientRect().top
        );
      });

      it('should render right panel next to top and bottom', () => {
        expect(harness.assertedRight.getBoundingClientRect().top).toBe(
          harness.assertedTop.getBoundingClientRect().bottom
        );

        expect(harness.assertedRight.getBoundingClientRect().bottom).toBe(
          harness.assertedBottom.getBoundingClientRect().top
        );
      });

      it('should render bottom panel next to left and right', () => {
        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedLeft.getBoundingClientRect().bottom
        );

        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedRight.getBoundingClientRect().bottom
        );
      });

      it('should render left panel next to top and bottom', () => {
        expect(harness.assertedLeft.getBoundingClientRect().top).toBe(
          harness.assertedTop.getBoundingClientRect().bottom
        );

        expect(harness.assertedLeft.getBoundingClientRect().bottom).toBe(
          harness.assertedBottom.getBoundingClientRect().top
        );
      });
    });

    describe('insets', () => {
      it('should render top inset', async () => {
        await setLayoutAttribute('top-inset', 100);

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-top-inset')
        ).toBe('100px');
      });

      it('should render right inset', async () => {
        await setLayoutAttribute('right-inset', 100);

        expect(
          harness
            .getLayout()
            .style.getPropertyValue('--berg-layout-right-inset')
        ).toBe('100px');
      });

      it('should render bottom inset', async () => {
        await setLayoutAttribute('bottom-inset', 100);

        expect(
          harness
            .getLayout()
            .style.getPropertyValue('--berg-layout-bottom-inset')
        ).toBe('100px');
      });

      it('should render left inset', async () => {
        await setLayoutAttribute('left-inset', 100);

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-left-inset')
        ).toBe('100px');
      });
    });

    describe('with an absolute panel', () => {
      it('should create a backdrop that covers the layout', async () => {
        await setPanelAttribute('top', 'absolute', true);
        expect(harness.getLayout().getBoundingClientRect()).toEqual(
          harness.getAssertedBackdrop('top').getBoundingClientRect()
        );
      });

      it('should position top over center', async () => {
        await setPanelAttribute('top', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingTop).toBe('0px');
      });

      it('should position right over center', async () => {
        await setPanelAttribute('right', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingRight).toBe(
          '0px'
        );
      });

      it('should position bottom over center', async () => {
        await setPanelAttribute('bottom', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingBottom).toBe(
          '0px'
        );
      });

      it('should position left over center', async () => {
        await setPanelAttribute('left', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingLeft).toBe(
          '0px'
        );
      });

      it('should emit backdropClicked event when clicking backdrop.', async () => {
        await setPanelAttribute('left', 'absolute', true);
        let clicked = false;

        harness.assertedLeft.addEventListener(
          'backdropClicked',
          () => (clicked = true)
        );

        await harness.clickBackdrop('left');
        expect(clicked).toEqual(true);
      });

      it('should close the panel when clicking the backdrop in "auto"-binding mode.', async () => {
        await setPanelAttribute('left', 'absolute', true);
        await setPanelAttribute('left', 'event-binding-mode', 'auto');
        await harness.clickBackdrop('left');

        expect(harness.isPanelCollapsed('left')).toBe(true);
      });

      it('should not close the panel when clicking the backdrop in "none"-binding mode.', async () => {
        await setPanelAttribute('left', 'absolute', true);
        await setPanelAttribute('left', 'event-binding-mode', 'none');
        await harness.clickBackdrop('left');

        expect(harness.isPanelCollapsed('left')).toBe(false);
      });
    });

    describe('when setting the collapsed attribute', () => {
      it('should collapse', async () => {
        await setPanelAttribute('left', 'collapsed', true);
        expect(harness.isPanelCollapsed('left')).toBe(true);
      });

      it('should expand', async () => {
        await setPanelAttribute('left', 'collapsed', true);
        await setPanelAttribute('left', 'collapsed', false);
        expect(harness.isPanelCollapsed('left')).toBe(false);
      });
    });
  });
};
