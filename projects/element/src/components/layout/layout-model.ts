import { InjectionToken } from '@angular/core';
import { BergCommonInputs, BERG_COMMON_DEFAULT_INPUTS } from '../input-model';

/** Inputs that can set on only layouts. */
export interface BergLayoutInputs {
  mobileBreakpoint: string;
  smallBreakpoint: string;
  mediumBreakpoint: string;
}

export interface BergLayoutInputs extends BergCommonInputs {
  mobileBreakpoint: string;
  smallBreakpoint: string;
  mediumBreakpoint: string;
}

export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  ...BERG_COMMON_DEFAULT_INPUTS,
  mobileBreakpoint: '800px',
  smallBreakpoint: '900px',
  mediumBreakpoint: '1100px',
};

export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);
