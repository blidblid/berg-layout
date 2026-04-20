import '@berg-layout/core';
import type { BergLayoutElement, BergLayoutInputs } from '@berg-layout/core';
import { BERG_LAYOUT_DEFAULT_INPUTS } from '@berg-layout/core';
import { forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import {
  toCustomElementAttributeValue,
  useForwardedElementRef,
} from '../custom-element';

export type BergLayoutProps = PropsWithChildren<Partial<BergLayoutInputs>> &
  Omit<HTMLAttributes<BergLayoutElement>, keyof BergLayoutInputs | 'children'>;

export const BERG_LAYOUT_DEFAULT_PROPS = BERG_LAYOUT_DEFAULT_INPUTS;

export const BergLayout = forwardRef<BergLayoutElement, BergLayoutProps>(
  function BergLayout(
    {
      children,
      resizeDisabled,
      resizeTwoDimensions,
      resizePreviewDelay,
      topLeftPosition,
      topRightPosition,
      bottomLeftPosition,
      bottomRightPosition,
      topInset,
      rightInset,
      bottomInset,
      leftInset,
      contentMinSize,
      resizeToggleSize,
      overflow,
      zIndexBase,
      gesturesDisabled,
      className,
      ...domProps
    }: BergLayoutProps,
    forwardedRef
  ) {
    const [, ref] = useForwardedElementRef(forwardedRef);

    return (
      <berg-layout-web-component
        ref={ref}
        class={className}
        resize-disabled={toCustomElementAttributeValue(resizeDisabled)}
        resize-two-dimensions={toCustomElementAttributeValue(
          resizeTwoDimensions
        )}
        resize-preview-delay={toCustomElementAttributeValue(resizePreviewDelay)}
        top-left-position={toCustomElementAttributeValue(topLeftPosition)}
        top-right-position={toCustomElementAttributeValue(topRightPosition)}
        bottom-left-position={toCustomElementAttributeValue(bottomLeftPosition)}
        bottom-right-position={toCustomElementAttributeValue(
          bottomRightPosition
        )}
        top-inset={toCustomElementAttributeValue(topInset)}
        right-inset={toCustomElementAttributeValue(rightInset)}
        bottom-inset={toCustomElementAttributeValue(bottomInset)}
        left-inset={toCustomElementAttributeValue(leftInset)}
        content-min-size={toCustomElementAttributeValue(contentMinSize)}
        resize-toggle-size={toCustomElementAttributeValue(resizeToggleSize)}
        overflow={toCustomElementAttributeValue(overflow)}
        z-index-base={toCustomElementAttributeValue(zIndexBase)}
        gestures-disabled={toCustomElementAttributeValue(gesturesDisabled)}
        {...domProps}
      >
        {children}
      </berg-layout-web-component>
    );
  }
);

export default BergLayout;
