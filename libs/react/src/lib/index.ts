import {
  BergLayoutInputs,
  BergPanelInputs,
  BERG_LAYOUT_TAG_NAME,
  BERG_PANEL_TAG_NAME,
} from '@berg-layout/core';
import { PropsWithChildren } from 'react';

export * from './layout/layout';
export * from './panel/panel';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [BERG_LAYOUT_TAG_NAME]: PropsWithChildren<Partial<BergLayoutInputs>>;
      [BERG_PANEL_TAG_NAME]: PropsWithChildren<Partial<BergPanelInputs>>;
    }
  }
}
