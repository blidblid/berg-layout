import { InjectionToken } from '@angular/core';
import { BergSharedInputs, BERG_SHARED_DEFAULT_INPUTS } from '../../core';

/** Inputs that can set on only layouts. */
export interface BergLayoutInputs extends BergSharedInputs {
  mobileBreakpoint: string;
  smallBreakpoint: string;
  mediumBreakpoint: string;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseRatio: number;
  resizePreviewDelay: number;
}

export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  ...BERG_SHARED_DEFAULT_INPUTS,
  mobileBreakpoint: '800px',
  smallBreakpoint: '900px',
  mediumBreakpoint: '1100px',
  resizeThreshold: 16,
  resizeCollapseRatio: 0.5,
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
