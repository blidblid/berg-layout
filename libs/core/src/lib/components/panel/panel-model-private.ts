import { BergPanelSlot } from './panel-model';

export const SNAP_PADDING = 16;
export const BACKDROP_ANIMATION_DURATION = 120;
export const TWO_DIMENSION_COLLECTION_DISTANCE = 8;
export const BACKDROP_Z_INDEX = 7;

export interface BergPanelSlotSize {
  slot: BergPanelSlot;
  size: number;
}

export type BergPanelVariables<T> = Partial<Record<BergPanelSlot, T>>;
