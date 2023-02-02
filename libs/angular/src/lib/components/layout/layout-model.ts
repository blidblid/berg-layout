import { InjectionToken } from '@angular/core';
import {
  BergLayoutAttributesCamelCased,
  BERG_LAYOUT_DEFAULTS_CAMEL_CASED,
} from '@berg-layout/core';

/** Inputs of berg-layout. */
export type BergLayoutInputs = BergLayoutAttributesCamelCased;

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutInputs]: BergLayoutInputs[P] | null;
};

/** Default inputs of berg-layout. */
export const BERG_LAYOUT_DEFAULT_INPUTS = BERG_LAYOUT_DEFAULTS_CAMEL_CASED;

/** Injection token used to set the default berg-layout inputs. */
export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);
