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

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutAttributes]: BergLayoutAttributes[P] | null;
};

/** Positions of the top panel. */
export type BergLayoutTopPosition = 'above' | 'between';

/** Positions of the bottom panel. */
export type BergLayoutBottomPosition = 'below' | 'between';

/** Default attributes of berg-layout. */
export const BERG_LAYOUT_DEFAULTS: BergLayoutAttributes = {
  'resize-disabled': false,
  'resize-two-dimensions': true,
  'resize-preview-delay': 200,
  'top-left-position': 'above',
  'top-right-position': 'above',
  'bottom-left-position': 'below',
  'bottom-right-position': 'below',
  'top-inset': 0,
  'right-inset': 0,
  'bottom-inset': 0,
  'left-inset': 0,
};
