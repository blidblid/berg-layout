import { InjectionToken } from '@angular/core';
import {
  BergLayoutBottomPosition,
  BergLayoutTopPosition,
} from '@berg-layout/core';

/** Inputs of berg-layout. */
export interface BergLayoutInputs {
  /** Whether resizing is disabled. */
  resizeDisabled: boolean;

  /** Whether two dimensional resizing is enabled. Keep in mind that enabling this option causes layout thrashing. */
  resizeTwoDimensions: boolean;

  /** Delay before the resize preview is shown. */
  resizePreviewDelay: number;

  /** Top panel position relative to the left panel. */
  topLeftPosition: BergLayoutTopPosition;

  /** Top panel position relative to the right panel. */
  topRightPosition: BergLayoutTopPosition;

  /** Bottom panel position relative to the left panel. */
  bottomLeftPosition: BergLayoutBottomPosition;

  /** Bottom panel position relative to the right panel. */
  bottomRightPosition: BergLayoutBottomPosition;

  /** Layout inset from the top of the viewport. */
  topInset: number;

  /** Layout inset from the right of the viewport. */
  rightInset: number;

  /** Layout inset from the bottom of the viewport. */
  bottomInset: number;

  /** Layout inset from the left of the viewport. */
  leftInset: number;
}

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutInputs]: BergLayoutInputs[P] | null;
};

/** Default inputs of berg-layout. */
export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  resizeDisabled: false,
  resizeTwoDimensions: true,
  resizePreviewDelay: 200,
  topLeftPosition: 'above',
  topRightPosition: 'above',
  bottomLeftPosition: 'below',
  bottomRightPosition: 'below',
  topInset: 0,
  rightInset: 0,
  bottomInset: 0,
  leftInset: 0,
};

/** Injection token used to set the default berg-layout inputs. */
export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);
