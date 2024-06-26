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

  /** Min layout content size during resizing. */
  contentMinSize: number;

  /** Resize toggle size. */
  resizeToggleSize: number;

  /**
   * Overflow of the layout content.
   * Note that the layout overflows using percentages.
   * Make sure that the parent element has a width to inherit from.
   */
  overflow: BergLayoutOverflow;
}

export type BergLayoutInput = keyof BergLayoutInputs;

export type BergLayoutOverflow = 'x' | 'y' | 'xy' | 'none';

/** Positions of the top panel. */
export type BergLayoutTopPosition = 'above' | 'beside';

/** Positions of the bottom panel. */
export type BergLayoutBottomPosition = 'below' | 'beside';
