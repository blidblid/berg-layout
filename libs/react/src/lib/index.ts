import {
  BERG_LAYOUT_TAG_NAME,
  BERG_PANEL_TAG_NAME,
  BergLayoutElement,
  BergPanelElement,
} from '@berg-layout/core';
import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from 'react';

export * from './custom-element';
export * from './layout/layout';
export * from './panel/panel';

type BergLayoutAttributeProps = PropsWithChildren<{
  class?: string;
  'resize-disabled'?: string;
  'resize-two-dimensions'?: string;
  'resize-preview-delay'?: string;
  'top-left-position'?: string;
  'top-right-position'?: string;
  'bottom-left-position'?: string;
  'bottom-right-position'?: string;
  'top-inset'?: string;
  'right-inset'?: string;
  'bottom-inset'?: string;
  'left-inset'?: string;
  'content-min-size'?: string;
  'resize-toggle-size'?: string;
  overflow?: string;
  'z-index-base'?: string;
  'gestures-disabled'?: string;
}>;

type BergPanelAttributeProps = PropsWithChildren<{
  class?: string;
  slot?: string;
  absolute?: string;
  collapsed?: string;
  'resize-disabled'?: string;
  size?: string;
  'min-size'?: string;
  'max-size'?: string;
  'animation-disabled'?: string;
  'hide-backdrop'?: string;
  'gestures-disabled'?: string;
}>;

type BergLayoutIntrinsicElementProps = DetailedHTMLProps<
  HTMLAttributes<BergLayoutElement>,
  BergLayoutElement
> &
  BergLayoutAttributeProps;

type BergPanelIntrinsicElementProps = DetailedHTMLProps<
  HTMLAttributes<BergPanelElement>,
  BergPanelElement
> &
  BergPanelAttributeProps;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      [BERG_LAYOUT_TAG_NAME]: BergLayoutIntrinsicElementProps;
      [BERG_PANEL_TAG_NAME]: BergPanelIntrinsicElementProps;
    }
  }
}
