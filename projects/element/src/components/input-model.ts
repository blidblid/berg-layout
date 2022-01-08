export const BERG_COMMON_DEFAULT_INPUTS: BergCommonInputs = {
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  resizeThreshold: 16,
  resizeCollapseThreshold: 0.5,
  resizeTwoDimensions: false,
  resizePreviewDelay: 200,
};

/** Inputs that can set on either layouts or panels. */
export interface BergCommonInputs {
  absolute: boolean;
  collapsed: boolean;
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseThreshold: number;
  resizePreviewDelay: number;
}
