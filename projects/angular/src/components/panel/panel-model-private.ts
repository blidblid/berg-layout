export const SNAP_PADDING = 16;
export const BACKDROP_ANIMATION_DURATION = 120;
export const TWO_DIMENSION_COLLECTION_DISTANCE = 8;
export const BACKDROP_Z_INDEX = 4;

export interface BergPanelResizeSize {
  rect: DOMRect;
  event: MouseEvent;
  width?: number;
  height?: number;
}
