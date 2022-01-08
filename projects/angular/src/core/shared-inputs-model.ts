export const BERG_SHARED_DEFAULT_INPUTS: BergSharedInputs = {
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  resizeThreshold: 16,
  resizeCollapseThreshold: 0.5,
  resizeTwoDimensions: false,
  resizePreviewDelay: 200,
};

/** Inputs that can set on either layouts or panels. */
export interface BergSharedInputs {
  absolute: boolean;
  collapsed: boolean;
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseThreshold: number;
  resizePreviewDelay: number;
}
