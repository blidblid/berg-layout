import { InjectionToken } from '@angular/core';

/** Inputs that can set on only layouts. */
export interface BergLayoutInputs {
  mobileBreakpoint: string;
  smallBreakpoint: string;
  mediumBreakpoint: string;
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeCollapseOffset: number;
  resizeExpandOffset: number;
  resizePreviewDelay: number;
}

export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  mobileBreakpoint: '800px',
  smallBreakpoint: '900px',
  mediumBreakpoint: '1100px',
  resizeDisabled: false,
  resizeCollapseOffset: 64,
  resizeExpandOffset: 64,
  resizeTwoDimensions: true,
  resizePreviewDelay: 200,
};

export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);

export interface BergLayoutElement {
  hostElem: HTMLElement;
}

export const BERG_LAYOUT_ELEMENT = new InjectionToken<BergLayoutElement>(
  'BERG_LAYOUT_ELEMENT'
);
