import { InjectionToken } from '@angular/core';

export const BERG_RESIZE_INPUTS = new InjectionToken<BergResizeInputs>(
  'BERG_RESIZE_INPUTS'
);

export const BERG_RESIZE_DEFAULT_INPUTS: BergResizeInputs = {
  position: null,
  disabled: false,
  threshold: 8,
};

export type BergResizePosition = 'above' | 'after' | 'below' | 'before' | null;

export interface BergResizeInputs {
  position: BergResizePosition;
  disabled: boolean;
  threshold: number;
}

export interface BergResizeSize {
  width?: number;
  height?: number;
}
