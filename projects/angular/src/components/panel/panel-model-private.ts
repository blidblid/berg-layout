export const BERG_RESIZE_SNAP_PADDING = 16;

// Use a debounce to prevent rapid resizes from trigger resize toggling
export const BERG_RESIZE_EXPAND_DEBOUNCE = 10;

export const BERG_RESIZE_TWO_DIMENSION_COLLECTION_DISTANCE = 8;

export const BERG_RESIZE_RESIZING_CLASS_NAME =
  'berg-panel-resize-toggle-resizing';

export const BERG_RESIZE_PREVIEWING_CLASS_NAME =
  'berg-panel-resize-toggle-previewing';

export interface BergPanelResizeSize {
  rect: DOMRect;
  width?: number;
  height?: number;
}

export type BergPanelResizePosition =
  | 'above'
  | 'after'
  | 'below'
  | 'before'
  | null;
