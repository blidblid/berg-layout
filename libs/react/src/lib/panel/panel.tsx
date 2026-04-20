import '@berg-layout/core';
import type {
  BergPanelElement,
  BergPanelGestureEvent,
  BergPanelInputs,
  BergPanelResizeEvent,
} from '@berg-layout/core';
import { BERG_PANEL_DEFAULT_INPUTS } from '@berg-layout/core';
import { forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import {
  toCustomElementAttributeValue,
  useCustomElementEvent,
  useForwardedElementRef,
} from '../custom-element';

export interface BergPanelEventProps {
  onAfterCollapsed?: () => void;
  onAfterExpanded?: () => void;
  onBackdropClicked?: (event: MouseEvent) => void;
  onGestured?: (event: BergPanelGestureEvent) => void;
  onResized?: (event: BergPanelResizeEvent) => void;
}

export type BergPanelProps = PropsWithChildren<Partial<BergPanelInputs>> &
  Omit<
    HTMLAttributes<BergPanelElement>,
    keyof BergPanelInputs | keyof BergPanelEventProps | 'children'
  > &
  BergPanelEventProps;

export const BERG_PANEL_DEFAULT_PROPS = BERG_PANEL_DEFAULT_INPUTS;

export const BergPanel = forwardRef<BergPanelElement, BergPanelProps>(
  function BergPanel(
    {
      children,
      slot,
      absolute,
      collapsed,
      resizeDisabled,
      size,
      minSize,
      maxSize,
      animationDisabled,
      hideBackdrop,
      gesturesDisabled,
      className,
      onAfterCollapsed,
      onAfterExpanded,
      onBackdropClicked,
      onGestured,
      onResized,
      ...domProps
    }: BergPanelProps,
    forwardedRef
  ) {
    const [element, ref] = useForwardedElementRef(forwardedRef);

    useCustomElementEvent(element, 'afterCollapsed', onAfterCollapsed);

    useCustomElementEvent(element, 'afterExpanded', onAfterExpanded);

    useCustomElementEvent<BergPanelElement, MouseEvent>(
      element,
      'backdropClicked',
      onBackdropClicked
    );

    useCustomElementEvent<BergPanelElement, BergPanelGestureEvent>(
      element,
      'gestured',
      onGestured
    );

    useCustomElementEvent<BergPanelElement, BergPanelResizeEvent>(
      element,
      'resized',
      onResized
    );

    return (
      <berg-panel-web-component
        ref={ref}
        class={className}
        slot={toCustomElementAttributeValue(slot)}
        absolute={toCustomElementAttributeValue(absolute)}
        collapsed={toCustomElementAttributeValue(collapsed)}
        resize-disabled={toCustomElementAttributeValue(resizeDisabled)}
        size={toCustomElementAttributeValue(size)}
        min-size={toCustomElementAttributeValue(minSize)}
        max-size={toCustomElementAttributeValue(maxSize)}
        animation-disabled={toCustomElementAttributeValue(animationDisabled)}
        hide-backdrop={toCustomElementAttributeValue(hideBackdrop)}
        gestures-disabled={toCustomElementAttributeValue(gesturesDisabled)}
        {...domProps}
      >
        {children}
      </berg-panel-web-component>
    );
  }
);

export default BergPanel;
