import { InjectionToken } from '@angular/core';

export const BERG_RESIZE_INPUTS = new InjectionToken<BergResizeInputs>(
  'BERG_RESIZE_INPUTS'
);

export const BERG_RESIZE_DEFAULT_INPUTS: BergResizeInputs = {
  position: null,
  disabled: false,
  resizeThreshold: 6,
  collapseThreshold: 0.5,
  previewDelay: 0,
};

export const BERG_RESIZE_EXPAND_PADDING = 16;

export type BergResizePosition = 'above' | 'after' | 'below' | 'before' | null;

export interface BergResizeInputs {
  position: BergResizePosition;
  disabled: boolean;
  resizeThreshold: number;
  collapseThreshold: number;
  previewDelay: number;
}

export interface BergResizeSize {
  rect: DOMRect;
  width?: number;
  height?: number;
}
