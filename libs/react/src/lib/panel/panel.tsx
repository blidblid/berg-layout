import '@berg-layout/core';
import {
  BERG_PANEL_DEFAULT_INPUTS,
  BergPanelInputs,
  BergPanelOutputs,
} from '@berg-layout/core';
import { HTMLAttributes, PropsWithChildren } from 'react';

export type BergPanelProps = PropsWithChildren<Partial<BergPanelInputs>> &
  HTMLAttributes<HTMLDivElement> & {
    [P in keyof BergPanelOutputs as `on${Capitalize<string & P>}`]?: (
      event: BergPanelOutputs[P]
    ) => void;
  };

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
      hide-backdrop={props.hideBackdrop}
    >
      {props.children}
    </berg-panel-web-component>
  );
}

// install force
export default BergPanel;
