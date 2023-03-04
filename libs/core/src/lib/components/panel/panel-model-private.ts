import { BergPanelSlot } from './panel-model';

export interface BergPanelSlotSize {
  slot: BergPanelSlot;
  size: number;
}

export type BergPanelVariables<T> = Partial<Record<BergPanelSlot, T>>;
