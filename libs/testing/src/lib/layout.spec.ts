import {
  BergLayoutAttribute,
  BergLayoutAttributes,
  BergLayoutElement,
  BergPanelAttribute,
  BergPanelAttributes,
  BergPanelElement,
  BergPanelSlot,
  BERG_LAYOUT_TAG_NAME,
} from '@berg-layout/core';
import { BergLayoutTestHarness } from './layout-test-harness';
import { runLayoutTests } from './run-layout-tests';

describe('web component layout', () => {
  beforeEach(async () => {
    await import('@berg-layout/core');

    const layout = document.createElement(
      'berg-layout-web-component'
    ) as BergLayoutElement;

    const center = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;
    center.setAttribute('slot', 'center');

    const top = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;
    top.setAttribute('slot', 'top');

    const right = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;
    right.setAttribute('slot', 'right');

    const bottom = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;
    bottom.setAttribute('slot', 'bottom');

    const left = document.createElement(
      'berg-panel-web-component'
    ) as BergPanelElement;
    left.setAttribute('slot', 'left');

    document.body.appendChild(layout);

    for (const panel of [center, top, right, bottom, left]) {
      layout.appendChild(panel);
    }
  });

  function getLayout() {
    const layout =
      document.querySelector<BergLayoutElement>(BERG_LAYOUT_TAG_NAME);

    if (!layout) {
      throw new Error('No layout found');
    }

    return layout;
  }

  function setLayoutAttribute<T extends BergLayoutAttribute>(
    attribute: T,
    value: BergLayoutAttributes[T]
  ) {
    const layout = document.querySelector<BergPanelElement>('.berg-layout');

    if (!layout) {
      throw new Error('No layout found');
    }

    layout.setAttribute(attribute, `${value}`);
    return Promise.resolve();
  }

  function setPanelAttribute<T extends BergPanelAttribute>(
    slot: BergPanelSlot,
    attribute: T,
    value: BergPanelAttributes[T]
  ) {
    const panel = document.querySelector<BergPanelElement>(
      `.berg-panel-${slot}`
    );

    if (!panel) {
      throw new Error(`No ${slot} panel found`);
    }

    panel.setAttribute(attribute, `${value}`);
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  const harness = new BergLayoutTestHarness(getLayout);
  runLayoutTests(harness, setLayoutAttribute, setPanelAttribute);

  afterEach(() => {
    const layout = document.querySelector<BergLayoutElement>(
      'berg-layout-web-component'
    );

    if (layout) {
      layout.remove();
    }
  });
});
