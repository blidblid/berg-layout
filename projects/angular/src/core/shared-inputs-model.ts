export const BERG_SHARED_DEFAULT_INPUTS: BergSharedInputs = {
  resizeDisabled: false,
  resizeThreshold: 16,
  resizeCollapseRatio: 0.5,
  resizeTwoDimensions: true,
  resizePreviewDelay: 200,
};

/** Inputs that can set on either layouts or panels. */
export interface BergSharedInputs {
  resizeDisabled: boolean;
  resizeTwoDimensions: boolean;
  resizeThreshold: number;
  resizeCollapseRatio: number;
  resizePreviewDelay: number;
}
