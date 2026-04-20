import {
  BergLayoutElement,
  BergPanelElement,
  BergPanelGestureEvent,
  BergPanelResizeEvent,
} from '@berg-layout/core';
import {
  BergLayoutTestHarness,
  Render,
  runLayoutTests,
} from '@berg-layout/testing';
import { render } from '@testing-library/react';
import { createRef } from 'react';

import { BergLayout, BergPanel } from '..';

describe('React implementation', () => {
  let container: HTMLElement;

  const renderLayout: Render = async (inputs) => {
    const r = render(
      <BergLayout
        {...inputs.layout}
        children={[
          <div key="content" slot="content" />,
          <BergPanel key="top" slot={'top'} {...inputs.top} />,
          <BergPanel key="right" slot={'right'} {...inputs.right} />,
          <BergPanel key="bottom" slot={'bottom'} {...inputs.bottom} />,
          <BergPanel key="left" slot={'left'} {...inputs.left} />,
        ]}
      />
    );

    container = r.container;
  };

  beforeEach(async () => {
    renderLayout({});
  });

  function getLayout(): BergLayoutElement {
    return container.querySelector('.berg-layout') as BergLayoutElement;
  }

  const harness = new BergLayoutTestHarness(getLayout);
  runLayoutTests(harness, renderLayout);

  describe('React wrapper API', () => {
    it('should forward refs to the custom elements', () => {
      const layoutRef = createRef<BergLayoutElement>();
      const panelRef = createRef<BergPanelElement>();

      render(
        <BergLayout ref={layoutRef}>
          <BergPanel ref={panelRef} slot="top" />
          <div slot="content" />
        </BergLayout>
      );

      expect(layoutRef.current?.tagName.toLowerCase()).toBe(
        'berg-layout-web-component'
      );

      expect(panelRef.current?.tagName.toLowerCase()).toBe(
        'berg-panel-web-component'
      );
    });

    it('should forward standard DOM props', () => {
      const { container } = render(
        <BergLayout
          className="layout-shell"
          contentMinSize={180}
          data-layout="shell"
          id="layout"
        >
          <BergPanel className="top-panel" data-panel="top" slot="top" />
          <div slot="content" />
        </BergLayout>
      );

      const layout = container.querySelector('berg-layout-web-component');
      const panel = container.querySelector('berg-panel-web-component');

      expect(layout?.id).toBe('layout');
      expect(layout?.getAttribute('data-layout')).toBe('shell');
      expect(layout?.classList.contains('layout-shell')).toBe(true);
      expect(layout?.getAttribute('content-min-size')).toBe('180');

      expect(panel?.getAttribute('data-panel')).toBe('top');
      expect(panel?.classList.contains('top-panel')).toBe(true);
    });

    it('should not force default input attributes for omitted props', () => {
      const { container } = render(
        <BergLayout>
          <BergPanel slot="top" />
          <div slot="content" />
        </BergLayout>
      );

      const layout = container.querySelector('berg-layout-web-component');
      const panel = container.querySelector('berg-panel-web-component');

      expect(layout?.hasAttribute('resize-two-dimensions')).toBe(false);
      expect(layout?.hasAttribute('resize-preview-delay')).toBe(false);
      expect(panel?.hasAttribute('collapsed')).toBe(false);
      expect(panel?.hasAttribute('size')).toBe(false);
    });

    it('should bridge panel custom events to React callbacks', () => {
      const resizedEvent = {
        event: new MouseEvent('mousemove'),
        size: 240,
      } satisfies BergPanelResizeEvent;
      const gestureEvent = {
        type: 'expand',
      } satisfies BergPanelGestureEvent;

      const onAfterCollapsed = jasmine.createSpy('onAfterCollapsed');
      const onAfterExpanded = jasmine.createSpy('onAfterExpanded');
      const onBackdropClicked = jasmine.createSpy('onBackdropClicked');
      const onGestured = jasmine.createSpy('onGestured');
      const onResized = jasmine.createSpy('onResized');

      const { container } = render(
        <BergLayout>
          <BergPanel
            slot="top"
            onAfterCollapsed={onAfterCollapsed}
            onAfterExpanded={onAfterExpanded}
            onBackdropClicked={onBackdropClicked}
            onGestured={onGestured}
            onResized={onResized}
          />
          <div slot="content" />
        </BergLayout>
      );

      const panel = container.querySelector(
        'berg-panel-web-component'
      ) as BergPanelElement;
      const backdropClickedEvent = new MouseEvent('click');

      panel.dispatchEvent(new CustomEvent('afterCollapsed'));
      panel.dispatchEvent(new CustomEvent('afterExpanded'));
      panel.dispatchEvent(
        new CustomEvent('backdropClicked', {
          detail: backdropClickedEvent,
        })
      );
      panel.dispatchEvent(
        new CustomEvent('gestured', {
          detail: gestureEvent,
        })
      );
      panel.dispatchEvent(
        new CustomEvent('resized', {
          detail: resizedEvent,
        })
      );

      expect(onAfterCollapsed).toHaveBeenCalledTimes(1);
      expect(onAfterExpanded).toHaveBeenCalledTimes(1);
      expect(onBackdropClicked).toHaveBeenCalledWith(backdropClickedEvent);
      expect(onGestured).toHaveBeenCalledWith(gestureEvent);
      expect(onResized).toHaveBeenCalledWith(resizedEvent);
    });
  });
});
