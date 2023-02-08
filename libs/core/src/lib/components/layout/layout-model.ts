/** Attributes of berg-layout. */
export interface BergLayoutAttributes {
  /** Whether resizing is disabled. */
  'resize-disabled': boolean;

  /** Whether two dimensional resizing is enabled. Keep in mind that enabling this option causes layout thrashing. */
  'resize-two-dimensions': boolean;

  /** Delay before the resize preview is shown. */
  'resize-preview-delay': number;

  /** Top panel position relative to the left panel. */
  'top-left-position': BergLayoutTopPosition;

  /** Top panel position relative to the right panel. */
  'top-right-position': BergLayoutTopPosition;

  /** Bottom panel position relative to the left panel. */
  'bottom-left-position': BergLayoutBottomPosition;

  /** Bottom panel position relative to the right panel. */
  'bottom-right-position': BergLayoutBottomPosition;

  /** Layout inset from the top of the viewport. */
  'top-inset': number;

  /** Layout inset from the right of the viewport. */
  'right-inset': number;

  /** Layout inset from the bottom of the viewport. */
  'bottom-inset': number;

  /** Layout inset from the left of the viewport. */
  'left-inset': number;
}

export type BergLayoutAttribute = keyof BergLayoutAttributes;

export interface BergLayoutAttributesCamelCased {
  /** Whether resizing is disabled. */
  resizeDisabled: BergLayoutAttributes['resize-disabled'];

  /** Whether two dimensional resizing is enabled. Keep in mind that enabling this option causes layout thrashing. */
  resizeTwoDimensions: BergLayoutAttributes['resize-two-dimensions'];

  /** Delay before the resize preview is shown. */
  resizePreviewDelay: BergLayoutAttributes['resize-preview-delay'];

  /** Top panel position relative to the left panel. */
  topLeftPosition: BergLayoutAttributes['top-left-position'];

  /** Top panel position relative to the right panel. */
  topRightPosition: BergLayoutAttributes['top-right-position'];

  /** Bottom panel position relative to the left panel. */
  bottomLeftPosition: BergLayoutAttributes['bottom-left-position'];

  /** Bottom panel position relative to the right panel. */
  bottomRightPosition: BergLayoutAttributes['bottom-right-position'];

  /** Layout inset from the top of the viewport. */
  topInset: BergLayoutAttributes['top-inset'];

  /** Layout inset from the right of the viewport. */
  rightInset: BergLayoutAttributes['right-inset'];

  /** Layout inset from the bottom of the viewport. */
  bottomInset: BergLayoutAttributes['bottom-inset'];

  /** Layout inset from the left of the viewport. */
  leftInset: BergLayoutAttributes['left-inset'];
}

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutAttributes]: BergLayoutAttributes[P] | null;
};

/** Positions of the top panel. */
export type BergLayoutTopPosition = 'above' | 'between';

/** Positions of the bottom panel. */
export type BergLayoutBottomPosition = 'below' | 'between';
