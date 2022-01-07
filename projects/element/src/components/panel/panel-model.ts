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

export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

export const BERG_PANEL_DEFAULT_INPUTS: BergPanelInputs = {
  absolute: false,
  collapsed: false,
  mobileBreakpoint: '800px',
  smallBreakpoint: '900px',
  mediumBreakpoint: '1100px',
  resizePosition: null,
  resizeDisabled: false,
  resizeThreshold: 16,
  resizeCollapseThreshold: 0.5,
  resizeTwoDimensions: false,
  resizePreviewDelay: 500,
};

export const BERG_RESIZE_EXPAND_PADDING = 16;

export type BergPanelResizePosition =
  | 'above'
  | 'after'
  | 'below'
  | 'before'
  | null;

export interface BergPanelInputs {
  absolute: boolean;
  collapsed: boolean;
  mobileBreakpoint: string;
  smallBreakpoint: string;
  mediumBreakpoint: string;
  resizePosition: BergPanelResizePosition;
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseThreshold: number;
  resizePreviewDelay: number;
}

export interface BergPanelResizeSize {
  rect: DOMRect;
  width?: number;
  height?: number;
}
