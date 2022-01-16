import { InjectionToken } from '@angular/core';

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
export interface BergPanelInputs {
  absolute: boolean;
  collapsed: boolean;
  resizeDisabled: boolean;
}

export const BERG_PANEL_DEFAULT_INPUTS: BergPanelInputs = {
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
};

export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

export const BERG_RESIZE_EXPAND_PADDING = 16;

export const BERG_RESIZE_TWO_DIMENSION_COLLECTION_DISTANCE = 8;

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
