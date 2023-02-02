import '@berg-layout/core';
import {
  BergLayoutAttributesCamelCased,
  BERG_LAYOUT_DEFAULTS_CAMEL_CASED,
} from '@berg-layout/core';
import { PropsWithChildren } from 'react';

export type BergLayoutProps = PropsWithChildren<
  Partial<BergLayoutAttributesCamelCased>
>;

export const BERG_LAYOUT_DEFAULT_PROPS = BERG_LAYOUT_DEFAULTS_CAMEL_CASED;

export function BergLayout(props: BergLayoutProps) {
  props = {
    ...BERG_LAYOUT_DEFAULT_PROPS,
    ...props,
  };

  return (
    <berg-layout-web-component
      resize-disabled={props.resizeDisabled}
      resize-two-dimensions={props.resizeTwoDimensions}
      resize-preview-delay={props.resizePreviewDelay}
      top-left-position={props.topLeftPosition}
      top-right-position={props.topRightPosition}
      bottom-left-position={props.bottomLeftPosition}
      bottom-right-position={props.bottomRightPosition}
      top-inset={props.topInset}
      right-inset={props.rightInset}
      bottom-inset={props.bottomInset}
      left-inset={props.leftInset}
    >
      {props.children}
    </berg-layout-web-component>
  );
}

export default BergLayout;
