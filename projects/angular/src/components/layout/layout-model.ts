import { InjectionToken } from '@angular/core';

/** Inputs that can set on only layouts. */
export interface BergLayoutInputs {
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeCollapseOffset: number;
  resizeExpandOffset: number;
  resizePreviewDelay: number;
}

export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  resizeDisabled: false,
  resizeCollapseOffset: 44,
  resizeExpandOffset: 44,
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
