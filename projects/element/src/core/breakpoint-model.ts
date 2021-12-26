import { InjectionToken } from '@angular/core';

export interface BergLayoutBreakpoints {
  mobile: string;
  small: string;
  medium: string;
}

export const BERG_LAYOUT_BREAKPOINTS =
  new InjectionToken<BergLayoutBreakpoints>('BERG_LAYOUT_BREAKPOINTS');

export const BERG_LAYOUT_DEFAULT_BREAKPOINTS: BergLayoutBreakpoints = {
  mobile: '800px',
  small: '900px',
  medium: '1100px',
};
