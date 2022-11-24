import { InjectionToken } from '@angular/core';

/** Inputs of berg-layout. */
export interface BergLayoutInputs {
  /** Whether resizing is disabled. */
  resizeDisabled: boolean;

  /** Whether two dimensional resizing is enabled. Keep in mind that enabling this option causes layout thrashing. */
  resizeTwoDimensions: boolean;

  /**
   * Pixel value to determine when resize events should snap panels shut.
   * If it's 32px, the panel will snap if its resized 32px less than its min-width.
   */
  resizeCollapseOffset: number;

  /**
   * Pixel value to determine when resize events should snap panels to expand.
   * If it's 32px, the panel will snap if its resized 32px greater than its max-width.
   */
  resizeExpandOffset: number;

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
}

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutInputs]: BergLayoutInputs[P] | null;
};

/** Positions of the top panel. */
export type BergLayoutTopPosition = 'above' | 'between';

/** Positions of the bottom panel. */
export type BergLayoutBottomPosition = 'below' | 'between';

/** Default inputs of berg-layout. */
export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  resizeDisabled: false,
  resizeCollapseOffset: 36,
  resizeExpandOffset: 36,
  resizeTwoDimensions: true,
  resizePreviewDelay: 200,
  topLeftPosition: 'above',
  topRightPosition: 'above',
  bottomLeftPosition: 'below',
  bottomRightPosition: 'below',
};

/** Injection token used to set the default berg-layout inputs. */
export const BERG_LAYOUT_INPUTS = new InjectionToken<BergLayoutInputs>(
  'BERG_LAYOUT_INPUTS'
);
