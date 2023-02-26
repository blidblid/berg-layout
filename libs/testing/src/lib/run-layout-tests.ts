/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BergLayoutTestHarness } from './layout-test-harness';
import { Render } from './run-layout-tests-model';

export const runLayoutTests = (
  harness: BergLayoutTestHarness,
  render: Render
) => {
  describe('berg layout', () => {
    describe('alignment', () => {
      it('should render top panel above left', async () => {
        await render({
          layout: {
            topLeftPosition: 'above',
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedLeft.getBoundingClientRect().top
        );
      });

      it('should render top panel beside left', async () => {
        await render({
          layout: {
            topLeftPosition: 'beside',
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().left).toBe(
          harness.assertedLeft.getBoundingClientRect().right
        );
      });

      it('should render top panel above right', async () => {
        await render({
          layout: {
            topRightPosition: 'above',
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(
          harness.assertedRight.getBoundingClientRect().top
        );
      });

      it('should render top panel beside right', async () => {
        await render({
          layout: {
            topRightPosition: 'beside',
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().right).toBe(
          harness.assertedRight.getBoundingClientRect().left
        );
      });

      it('should render bottom panel below left', async () => {
        await render({
          layout: {
            bottomLeftPosition: 'below',
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedLeft.getBoundingClientRect().bottom
        );
      });

      it('should render bottom panel beside left', async () => {
        await render({
          layout: {
            bottomLeftPosition: 'beside',
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(
          harness.assertedLeft.getBoundingClientRect().right
        );
      });

      it('should render bottom panel below right', async () => {
        await render({
          layout: {
            bottomRightPosition: 'below',
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          harness.assertedRight.getBoundingClientRect().bottom
        );
      });

      it('should render bottom panel beside right', async () => {
        await render({
          layout: {
            bottomRightPosition: 'beside',
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().right).toBe(
          harness.assertedRight.getBoundingClientRect().left
        );
      });
    });

    describe('insets', () => {
      it('should render top inset', async () => {
        await render({
          layout: {
            topInset: 100,
          },
          top: {
            size: 100,
          },
        });

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-top-inset')
        ).toBe('100px');

        expect(harness.assertedTop.getBoundingClientRect().top).toBe(100);
        expect(harness.assertedRight.getBoundingClientRect().top).toBe(200);
        expect(harness.assertedLeft.getBoundingClientRect().top).toBe(200);
      });

      it('should render right inset', async () => {
        await render({
          layout: {
            rightInset: 100,
          },
        });

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
        await render({
          layout: {
            bottomInset: 100,
          },
          bottom: {
            size: 100,
          },
        });

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
        await render({
          layout: {
            leftInset: 100,
          },
        });

        expect(
          harness.getLayout().style.getPropertyValue('--berg-layout-left-inset')
        ).toBe('100px');

        expect(harness.assertedTop.getBoundingClientRect().left).toBe(100);
        expect(harness.assertedLeft.getBoundingClientRect().left).toBe(100);
        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(100);
      });
    });

    describe('stacking', () => {
      it('should render top panel on top of left', async () => {
        await render({
          layout: {
            topLeftPosition: 'above',
          },
        });

        expect(
          parseInt(getComputedStyle(harness.assertedTop).zIndex)
        ).toBeGreaterThan(
          parseInt(getComputedStyle(harness.assertedLeft).zIndex)
        );
      });

      it('should render top panel on top of right', async () => {
        await render({
          layout: {
            topRightPosition: 'above',
          },
        });

        expect(
          parseInt(getComputedStyle(harness.assertedTop).zIndex)
        ).toBeGreaterThan(
          parseInt(getComputedStyle(harness.assertedRight).zIndex)
        );
      });

      it('should render bottom panel on top of left', async () => {
        await render({
          layout: {
            bottomLeftPosition: 'below',
          },
        });

        expect(
          parseInt(getComputedStyle(harness.assertedBottom).zIndex)
        ).toBeGreaterThan(
          parseInt(getComputedStyle(harness.assertedLeft).zIndex)
        );
      });

      it('should render bottom panel on top of right', async () => {
        await render({
          layout: {
            bottomRightPosition: 'below',
          },
        });

        expect(
          parseInt(getComputedStyle(harness.assertedBottom).zIndex)
        ).toBeGreaterThan(
          parseInt(getComputedStyle(harness.assertedRight).zIndex)
        );
      });

      it('should render the backdrop above all other panels except an absolute top panel', async () => {
        await render({
          top: {
            absolute: true,
          },
        });

        const backdrop = harness.getAssertedBackdrop('top');
        const top = harness.assertedTop;
        const right = harness.assertedRight;
        const bottom = harness.assertedBottom;
        const left = harness.assertedLeft;

        expect(parseInt(getComputedStyle(top).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(backdrop).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(right).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(bottom).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(left).zIndex)
        );
      });

      it('should render the backdrop above all other panels except an absolute right panel', async () => {
        await render({
          right: {
            absolute: true,
          },
        });

        const backdrop = harness.getAssertedBackdrop('right');
        const top = harness.assertedTop;
        const right = harness.assertedRight;
        const bottom = harness.assertedBottom;
        const left = harness.assertedLeft;

        expect(parseInt(getComputedStyle(right).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(backdrop).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(top).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(bottom).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(left).zIndex)
        );
      });

      it('should render the backdrop above all other panels except an absolute bottom panel', async () => {
        await render({
          bottom: {
            absolute: true,
          },
        });

        const backdrop = harness.getAssertedBackdrop('bottom');
        const top = harness.assertedTop;
        const right = harness.assertedRight;
        const bottom = harness.assertedBottom;
        const left = harness.assertedLeft;

        expect(parseInt(getComputedStyle(bottom).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(backdrop).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(top).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(right).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(left).zIndex)
        );
      });

      it('should render the backdrop above all other panels except an absolute left panel', async () => {
        await render({
          left: {
            absolute: true,
          },
        });

        const backdrop = harness.getAssertedBackdrop('left');
        const top = harness.assertedTop;
        const right = harness.assertedRight;
        const bottom = harness.assertedBottom;
        const left = harness.assertedLeft;

        expect(parseInt(getComputedStyle(left).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(backdrop).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(top).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(right).zIndex)
        );

        expect(parseInt(getComputedStyle(backdrop).zIndex)).toBeGreaterThan(
          parseInt(getComputedStyle(bottom).zIndex)
        );
      });
    });

    describe('resizing', () => {
      it('should resize top panel', async () => {
        await harness.resize('top', 200);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(200);

        render({
          top: {
            minSize: 100,
          },
        });

        await harness.resize('top', 50);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(100);

        render({
          top: {
            maxSize: 150,
          },
        });

        await harness.resize('top', 200);
        expect(harness.assertedTop.getBoundingClientRect().height).toBe(150);
      });

      it('should resize right panel', async () => {
        await harness.resize('right', 200);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(200);

        render({
          right: {
            minSize: 100,
          },
        });

        await harness.resize('right', 50);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(100);

        render({
          right: {
            maxSize: 150,
          },
        });

        await harness.resize('right', 200);
        expect(harness.assertedRight.getBoundingClientRect().width).toBe(150);
      });

      it('should resize bottom panel', async () => {
        await harness.resize('bottom', 200);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(200);

        render({
          bottom: {
            minSize: 100,
          },
        });

        await harness.resize('bottom', 50);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(100);

        render({
          bottom: {
            maxSize: 150,
          },
        });

        await harness.resize('bottom', 200);
        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(150);
      });

      it('should resize left panel', async () => {
        await harness.resize('left', 200);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(200);

        render({
          left: {
            minSize: 100,
          },
        });

        await harness.resize('left', 50);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(100);

        render({
          left: {
            maxSize: 150,
          },
        });

        await harness.resize('left', 200);
        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(150);
      });
    });

    describe('size', () => {
      it('should set top panel size', async () => {
        await render({
          top: {
            size: 55,
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().height).toBe(55);
      });

      it('should set right panel size', async () => {
        await render({
          right: {
            size: 55,
          },
        });

        expect(harness.assertedRight.getBoundingClientRect().width).toBe(55);
      });

      it('should set bottom panel size', async () => {
        await render({
          bottom: {
            size: 55,
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(55);
      });

      it('should set left panel size', async () => {
        await render({
          left: {
            size: 55,
          },
        });

        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(55);
      });
    });

    describe('min size', () => {
      it('should set top panel min size', async () => {
        await render({
          top: {
            size: 55,
            minSize: 105,
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().height).toBe(105);
      });

      it('should set right panel min size', async () => {
        await render({
          right: {
            size: 55,
            minSize: 105,
          },
        });

        expect(harness.assertedRight.getBoundingClientRect().width).toBe(105);
      });

      it('should set bottom panel min size', async () => {
        await render({
          bottom: {
            size: 55,
            minSize: 105,
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(105);
      });

      it('should set left panel min size', async () => {
        await render({
          left: {
            size: 55,
            minSize: 105,
          },
        });

        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(105);
      });
    });

    describe('max size', () => {
      it('should set top panel max size', async () => {
        await render({
          top: {
            size: 155,
            maxSize: 105,
          },
        });

        expect(harness.assertedTop.getBoundingClientRect().height).toBe(105);
      });

      it('should set right panel max size', async () => {
        await render({
          right: {
            size: 155,
            maxSize: 105,
          },
        });

        expect(harness.assertedRight.getBoundingClientRect().width).toBe(105);
      });

      it('should set bottom panel max size', async () => {
        await render({
          bottom: {
            size: 155,
            maxSize: 105,
          },
        });

        expect(harness.assertedBottom.getBoundingClientRect().height).toBe(105);
      });

      it('should set left panel max size', async () => {
        await render({
          left: {
            size: 155,
            maxSize: 105,
          },
        });

        expect(harness.assertedLeft.getBoundingClientRect().width).toBe(105);
      });
    });

    describe('with an absolute panel', () => {
      it('should create a backdrop that covers the layout', async () => {
        await render({
          top: {
            absolute: true,
          },
        });

        expect(harness.getLayout().getBoundingClientRect()).toEqual(
          harness.getAssertedBackdrop('top').getBoundingClientRect()
        );
      });

      it('should position top over center', async () => {
        await render({
          top: {
            absolute: true,
          },
        });

        expect(getComputedStyle(harness.assertedCenter).paddingTop).toBe('0px');
        expect(harness.assertedTop.getBoundingClientRect().left).toBe(0);
        expect(harness.assertedTop.getBoundingClientRect().right).toBe(
          harness.assertedTop.getBoundingClientRect().width
        );
      });

      it('should position right over center', async () => {
        await render({
          right: {
            absolute: true,
          },
        });

        expect(getComputedStyle(harness.assertedCenter).paddingRight).toBe(
          '0px'
        );

        expect(harness.assertedRight.getBoundingClientRect().top).toBe(0);
        expect(harness.assertedRight.getBoundingClientRect().bottom).toBe(
          harness.assertedRight.getBoundingClientRect().height
        );
      });

      it('should position bottom over center', async () => {
        await render({
          bottom: {
            absolute: true,
          },
        });

        expect(getComputedStyle(harness.assertedCenter).paddingBottom).toBe(
          '0px'
        );

        expect(harness.assertedBottom.getBoundingClientRect().left).toBe(0);
        expect(harness.assertedBottom.getBoundingClientRect().right).toBe(
          harness.assertedBottom.getBoundingClientRect().width
        );
      });

      it('should position left over center', async () => {
        await render({
          left: {
            absolute: true,
          },
        });

        expect(getComputedStyle(harness.assertedCenter).paddingLeft).toBe(
          '0px'
        );

        expect(harness.assertedLeft.getBoundingClientRect().top).toBe(0);
        expect(harness.assertedLeft.getBoundingClientRect().bottom).toBe(
          harness.assertedLeft.getBoundingClientRect().height
        );
      });

      it('should emit backdropClicked event when clicking backdrop.', async () => {
        await render({
          left: {
            absolute: true,
          },
        });

        let clicked = false;

        harness.assertedLeft.addEventListener(
          'backdropClicked',
          () => (clicked = true)
        );

        await harness.clickBackdrop('left');
        expect(clicked).toEqual(true);
      });

      it('should close the panel when clicking the backdrop in "auto"-binding mode.', async () => {
        await render({
          left: {
            absolute: true,
            eventBindingMode: 'auto',
          },
        });

        await harness.clickBackdrop('left');

        expect(harness.isPanelCollapsed('left')).toBe(true);
      });

      it('should not close the panel when clicking the backdrop in "none"-binding mode.', async () => {
        await render({
          left: {
            absolute: true,
            eventBindingMode: 'none',
          },
        });

        await harness.clickBackdrop('left');

        expect(harness.isPanelCollapsed('left')).toBe(false);
      });
    });

    describe('when setting the collapsed attribute', () => {
      it('should collapse left', async () => {
        await render({
          left: {
            size: 100,
            collapsed: true,
          },
        });

        expect(harness.isPanelCollapsed('left')).toBe(true);
        expect(harness.assertedLeft.getBoundingClientRect().right).toBe(0);
        expect(harness.assertedLeft.getBoundingClientRect().left).toBe(-100);
      });

      it('should collapse right', async () => {
        await render({
          right: {
            size: 100,
            collapsed: true,
          },
        });

        expect(harness.isPanelCollapsed('right')).toBe(true);
        expect(harness.assertedRight.getBoundingClientRect().left).toBe(
          document.documentElement.getBoundingClientRect().width
        );

        expect(harness.assertedRight.getBoundingClientRect().right).toBe(
          document.documentElement.getBoundingClientRect().width + 100
        );
      });

      it('should collapse top', async () => {
        await render({
          top: {
            size: 100,
            collapsed: true,
          },
        });

        expect(harness.isPanelCollapsed('top')).toBe(true);
        expect(harness.assertedTop.getBoundingClientRect().bottom).toBe(0);
        expect(harness.assertedTop.getBoundingClientRect().top).toBe(-100);
      });

      it('should collapse bottom', async () => {
        await render({
          bottom: {
            size: 100,
            collapsed: true,
          },
        });

        expect(harness.isPanelCollapsed('bottom')).toBe(true);
        expect(harness.assertedBottom.getBoundingClientRect().top).toBe(
          window.innerHeight
        );

        expect(harness.assertedBottom.getBoundingClientRect().bottom).toBe(
          window.innerHeight + 100
        );
      });

      it('should expand', async () => {
        await render({
          left: {
            collapsed: false,
          },
        });

        expect(harness.isPanelCollapsed('left')).toBe(false);
      });
    });
  });
};
