import '@berg-layout/core';
import {
  BergPanelAttributesCamelCased,
  BERG_PANEL_DEFAULTS_CAMEL_CASED,
} from '@berg-layout/core';
import { PropsWithChildren } from 'react';

export type BergPanelProps = PropsWithChildren<
  Partial<BergPanelAttributesCamelCased>
>;

export const BERG_PANEL_DEFAULT_PROPS = BERG_PANEL_DEFAULTS_CAMEL_CASED;

export function BergPanel(props: BergPanelProps) {
  props = {
    ...props,
    ...BERG_PANEL_DEFAULT_PROPS,
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
      event-binding-mode={props.eventBindingMode}
    >
      {props.children}
    </berg-panel-web-component>
  );
}

// install force
export default BergPanel;
