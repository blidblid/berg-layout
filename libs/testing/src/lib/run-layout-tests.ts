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
      it('should render top panel above left', async () => {
        await setLayoutAttribute('top-left-position', 'above');

        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedLeft.getBoundingClientRect().top
        );
      });

      it('should render top panel beside left', async () => {
        await setLayoutAttribute('top-left-position', 'beside');

        expect(harness.assertedTop.getBoundingClientRect().left).toBe(
          harness.assertedLeft.getBoundingClientRect().right
        );
      });

      it('should render top panel above right', async () => {
        await setLayoutAttribute('top-right-position', 'above');

        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedRight.getBoundingClientRect().top
        );
      });

      it('should render top panel beside right', async () => {
        await setLayoutAttribute('top-right-position', 'beside');

        expect(harness.assertedTop.getBoundingClientRect().right).toBe(
          harness.assertedRight.getBoundingClientRect().left
        );
      });

      it('should render bottom panel below left', async () => {
        await setLayoutAttribute('bottom-left-position', 'below');

        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedLeft.getBoundingClientRect().bottom
        );
      });

      it('should render bottom panel beside left', async () => {
        await setLayoutAttribute('bottom-left-position', 'beside');

        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(
          harness.assertedLeft.getBoundingClientRect().right
        );
      });

      it('should render bottom panel below right', async () => {
        await setLayoutAttribute('bottom-right-position', 'below');

        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedRight.getBoundingClientRect().bottom
        );
      });

      it('should render bottom panel beside right', async () => {
        await setLayoutAttribute('bottom-right-position', 'beside');

        expect(harness.assertedBottom.getBoundingClientRect().right).toBe(
          harness.assertedRight.getBoundingClientRect().left
        );
      });
    });

    describe('insets', () => {
      it('should render top inset', async () => {
        await setLayoutAttribute('top-inset', 100);
        await setPanelAttribute('top', 'size', 100);

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-top-inset')
        ).toBe('100px');

        expect(harness.assertedTop.getBoundingClientRect().top).toBe(100);
        expect(harness.assertedRight.getBoundingClientRect().top).toBe(200);
        expect(harness.assertedLeft.getBoundingClientRect().top).toBe(200);
      });

      it('should render right inset', async () => {
        await setLayoutAttribute('right-inset', 100);

        expect(
          harness
            .getLayout()
            .style.getPropertyValue('--berg-layout-right-inset')
        ).toBe('100px');

        expect(harness.assertedTop.getBoundingClientRect().right).toBe(
          document.documentElement.getBoundingClientRect().width - 100
        );

        expect(harness.assertedRight.getBoundingClientRect().right).toBe(
          document.documentElement.getBoundingClientRect().width - 100
        );

        expect(harness.assertedBottom.getBoundingClientRect().right).toBe(
          document.documentElement.getBoundingClientRect().width - 100
        );
      });

      it('should render bottom inset', async () => {
        await setLayoutAttribute('bottom-inset', 100);
        await setPanelAttribute('bottom', 'size', 100);

        expect(
          harness
            .getLayout()
            .style.getPropertyValue('--berg-layout-bottom-inset')
        ).toBe('100px');

        expect(harness.assertedRight.getBoundingClientRect().bottom).toBe(
          window.innerHeight - 200
        );

        expect(harness.assertedBottom.getBoundingClientRect().bottom).toBe(
          window.innerHeight - 100
        );

        expect(harness.assertedLeft.getBoundingClientRect().bottom).toBe(
          window.innerHeight - 200
        );
      });

      it('should render left inset', async () => {
        await setLayoutAttribute('left-inset', 100);

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-left-inset')
        ).toBe('100px');

        expect(harness.assertedTop.getBoundingClientRect().left).toBe(100);
        expect(harness.assertedLeft.getBoundingClientRect().left).toBe(100);
        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(100);
      });
    });

    describe('size', () => {
      it('should set top panel size', async () => {
        await setPanelAttribute('top', 'size', 55);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(55);
      });

      it('should set right panel size', async () => {
        await setPanelAttribute('right', 'size', 55);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(55);
      });

      it('should set bottom panel size', async () => {
        await setPanelAttribute('bottom', 'size', 55);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(55);
      });

      it('should set left panel size', async () => {
        await setPanelAttribute('left', 'size', 55);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(55);
      });
    });

    describe('min size', () => {
      it('should set top panel min size', async () => {
        await setPanelAttribute('top', 'size', 55);
        await setPanelAttribute('top', 'min-size', 105);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(105);
      });

      it('should set right panel min size', async () => {
        await setPanelAttribute('right', 'size', 55);
        await setPanelAttribute('right', 'min-size', 105);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(105);
      });

      it('should set bottom panel min size', async () => {
        await setPanelAttribute('bottom', 'size', 55);
        await setPanelAttribute('bottom', 'min-size', 105);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(105);
      });

      it('should set left panel min size', async () => {
        await setPanelAttribute('left', 'size', 55);
        await setPanelAttribute('left', 'min-size', 105);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(105);
      });
    });

    describe('max size', () => {
      it('should set top panel max size', async () => {
        await setPanelAttribute('top', 'size', 155);
        await setPanelAttribute('top', 'max-size', 105);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(105);
      });

      it('should set right panel max size', async () => {
        await setPanelAttribute('right', 'size', 155);
        await setPanelAttribute('right', 'max-size', 105);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(105);
      });

      it('should set bottom panel max size', async () => {
        await setPanelAttribute('bottom', 'size', 155);
        await setPanelAttribute('bottom', 'max-size', 105);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(105);
      });

      it('should set left panel max size', async () => {
        await setPanelAttribute('left', 'size', 155);
        await setPanelAttribute('left', 'max-size', 105);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(105);
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
        expect(harness.assertedTop.getBoundingClientRect().left).toBe(0);
        expect(harness.assertedTop.getBoundingClientRect().right).toBe(
          harness.assertedTop.getBoundingClientRect().width
        );
      });

      it('should position right over center', async () => {
        await setPanelAttribute('right', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingRight).toBe(
          '0px'
        );

        expect(harness.assertedRight.getBoundingClientRect().top).toBe(0);
        expect(harness.assertedRight.getBoundingClientRect().bottom).toBe(
          harness.assertedRight.getBoundingClientRect().height
        );
      });

      it('should position bottom over center', async () => {
        await setPanelAttribute('bottom', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingBottom).toBe(
          '0px'
        );

        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(0);
        expect(harness.assertedBottom.getBoundingClientRect().right).toBe(
          harness.assertedBottom.getBoundingClientRect().width
        );
      });

      it('should position left over center', async () => {
        await setPanelAttribute('left', 'absolute', true);
        expect(getComputedStyle(harness.assertedCenter).paddingLeft).toBe(
          '0px'
        );

        expect(harness.assertedLeft.getBoundingClientRect().top).toBe(0);
        expect(harness.assertedLeft.getBoundingClientRect().bottom).toBe(
          harness.assertedLeft.getBoundingClientRect().height
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
      it('should collapse left', async () => {
        await setPanelAttribute('left', 'size', 100);
        await setPanelAttribute('left', 'collapsed', true);

        expect(harness.isPanelCollapsed('left')).toBe(true);
        expect(harness.assertedLeft.getBoundingClientRect().right).toBe(0);
        expect(harness.assertedLeft.getBoundingClientRect().left).toBe(-100);
      });

      it('should collapse right', async () => {
        await setPanelAttribute('right', 'size', 100);
        await setPanelAttribute('right', 'collapsed', true);

        expect(harness.isPanelCollapsed('right')).toBe(true);
        expect(harness.assertedRight.getBoundingClientRect().left).toBe(
          document.documentElement.getBoundingClientRect().width
        );

        expect(harness.assertedRight.getBoundingClientRect().right).toBe(
          document.documentElement.getBoundingClientRect().width + 100
        );
      });

      it('should collapse top', async () => {
        await setPanelAttribute('top', 'size', 100);
        await setPanelAttribute('top', 'collapsed', true);

        expect(harness.isPanelCollapsed('top')).toBe(true);
        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(0);
        expect(harness.assertedTop.getBoundingClientRect().top).toBe(-100);
      });

      it('should collapse bottom', async () => {
        await setPanelAttribute('bottom', 'size', 100);
        await setPanelAttribute('bottom', 'collapsed', true);

        expect(harness.isPanelCollapsed('bottom')).toBe(true);
        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          window.innerHeight
        );

        expect(harness.assertedBottom.getBoundingClientRect().bottom).toBe(
          window.innerHeight + 100
        );
      });

      it('should expand', async () => {
        await setPanelAttribute('left', 'collapsed', true);
        await setPanelAttribute('left', 'collapsed', false);
        expect(harness.isPanelCollapsed('left')).toBe(false);
      });
    });
  });
};
