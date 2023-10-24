import '@berg-layout/core';
import { BergPanelInputs, BERG_PANEL_DEFAULT_INPUTS } from '@berg-layout/core';
import { PropsWithChildren } from 'react';

export type BergPanelProps = PropsWithChildren<Partial<BergPanelInputs>>;

export const BERG_PANEL_DEFAULT_PROPS = BERG_PANEL_DEFAULT_INPUTS;

export function BergPanel(props: BergPanelProps) {
  props = {
    ...BERG_PANEL_DEFAULT_PROPS,
    ...props,
  };

  return (
    <berg-panel-web-component
      slot={props.slot}
      absolute={props.absolute}
      collapsed={props.collapsed}
      resize-disabled={props.resizeDisabled}
      size={props.size}
      min-size={props.minSize}
      max-size={props.maxSize}
      animation-disabled={props.animationDisabled}
      event-binding-mode={props.eventBindingMode}
    >
      {props.children}
    </berg-panel-web-component>
  );
}

// install force
export default BergPanel;
