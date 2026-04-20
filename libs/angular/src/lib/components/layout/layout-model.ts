import { InjectionToken } from '@angular/core';
import {
  BERG_LAYOUT_DEFAULT_INPUTS as BERG_LAYOUT_DEFAULTS_INPUTS_CORE,
  BergLayoutInputs as BergLayoutInputsCore,
} from '@berg-layout/core';

/** Inputs of berg-layout. */
export type BergLayoutInputs = BergLayoutInputsCore;

/** Default inputs of berg-layout. */
export const BERG_LAYOUT_DEFAULT_INPUTS = BERG_LAYOUT_DEFAULTS_INPUTS_CORE;

/** Injection token used to set the default berg-layout inputs. */
export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);
