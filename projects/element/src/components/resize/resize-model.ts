import { InjectionToken } from '@angular/core';

export const BERG_RESIZE_INPUTS = new InjectionToken<BergResizeInputs>(
  'BERG_RESIZE_INPUTS'
);

export const BERG_RESIZE_DEFAULT_INPUTS: BergResizeInputs = {
  resizePosition: null,
  resizeDisabled: false,
  resizeThreshold: 16,
  resizeCollapseThreshold: 0.5,
  resizeTwoDimensions: false,
  resizePreviewDelay: 0,
};

export const BERG_RESIZE_EXPAND_PADDING = 16;

export type BergResizePosition = 'above' | 'after' | 'below' | 'before' | null;

export interface BergResizeInputs {
  resizePosition: BergResizePosition;
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseThreshold: number;
  resizePreviewDelay: number;
}

export interface BergResizeSize {
  rect: DOMRect;
  width?: number;
  height?: number;
}
