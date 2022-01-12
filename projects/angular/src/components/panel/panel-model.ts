import { InjectionToken } from '@angular/core';
import { BergSharedInputs, BERG_SHARED_DEFAULT_INPUTS } from '../../core';

export interface BergPanel {
  slot: BergPanelSlot;
  absolute: boolean;
  collapsed: boolean;
  hostElem: HTMLElement;
}

export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';

export interface BergPanelBreakpoints {
  mobile: string;
  small: string;
  medium: string;
}

/** Inputs that can set on panels. */
export interface BergPanelInputs extends BergSharedInputs {
  absolute: boolean;
  collapsed: boolean;
}

export const BERG_PANEL_DEFAULT_INPUTS = {
  absolute: false,
  collapsed: false,
  ...BERG_SHARED_DEFAULT_INPUTS,
};

export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

export const BERG_RESIZE_EXPAND_PADDING = 16;

export type BergPanelResizePosition =
  | 'above'
  | 'after'
  | 'below'
  | 'before'
  | null;

export interface BergPanelResizeSize {
  rect: DOMRect;
  width?: number;
  height?: number;
}
