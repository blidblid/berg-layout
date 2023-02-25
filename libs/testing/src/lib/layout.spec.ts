import {
  BergLayoutElement,
  BergLayoutInput,
  BergPanelElement,
  BergPanelInput,
  BergPanelInputs,
  BergPanelSlot,
  BERG_LAYOUT_ATTRIBUTE_BY_INPUT,
  BERG_LAYOUT_TAG_NAME,
  BERG_PANEL_ATTRIBUTE_BY_INPUT,
} from '@berg-layout/core';
import { BergLayoutTestHarness } from './layout-test-harness';
import { runLayoutTests } from './run-layout-tests';
import { Render } from './run-layout-tests-model';

const render: Render = async (inputs) => {
  const { layout, top, right, bottom, left } = inputs;

  if (layout) {
    for (const [attribute, value] of Object.entries(layout)) {
      const layout = document.querySelector<BergPanelElement>('.berg-layout');

      if (!layout) {
        throw new Error('No layout found');
      }

      layout.setAttribute(
        BERG_LAYOUT_ATTRIBUTE_BY_INPUT[attribute as BergLayoutInput],
        `${value}`
      );
    }
  }

  if (top) {
    for (const [attribute, value] of Object.entries(top)) {
      setPanelAttribute('top', attribute as BergPanelInput, value);
    }
  }

  if (right) {
    for (const [attribute, value] of Object.entries(right)) {
      setPanelAttribute('right', attribute as BergPanelInput, value);
    }
  }

  if (bottom) {
    for (const [attribute, value] of Object.entries(bottom)) {
      setPanelAttribute('bottom', attribute as BergPanelInput, value);
    }
  }

  if (left) {
    for (const [attribute, value] of Object.entries(left)) {
      setPanelAttribute('left', attribute as BergPanelInput, value);
    }
  }
};

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

  const harness = new BergLayoutTestHarness(getLayout);
  runLayoutTests(harness, render);

  afterEach(() => {
    const layout = document.querySelector<BergLayoutElement>(
      'berg-layout-web-component'
    );

    if (layout) {
      layout.remove();
    }
  });
});

function setPanelAttribute<T extends BergPanelInput>(
  slot: BergPanelSlot,
  attribute: T,
  value: BergPanelInputs[T]
) {
  const panel = document.querySelector<BergPanelElement>(`.berg-panel-${slot}`);

  if (!panel) {
    throw new Error(`No ${slot} panel found`);
  }

  panel.setAttribute(BERG_PANEL_ATTRIBUTE_BY_INPUT[attribute], `${value}`);
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function getLayout() {
  const layout =
    document.querySelector<BergLayoutElement>(BERG_LAYOUT_TAG_NAME);

  if (!layout) {
    throw new Error('No layout found');
  }

  return layout;
}
