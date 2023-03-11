import { BergLayoutElement } from '@berg-layout/core';
import {
  BergLayoutTestHarness,
  Render,
  runLayoutTests,
} from '@berg-layout/testing';
import { render } from '@testing-library/react';

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
});
