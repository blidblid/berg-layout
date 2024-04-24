import { BergPanelSlot } from './panel-model';

export function validateSlot(slot: string): BergPanelSlot {
  if (
    slot !== 'top' &&
    slot !== 'right' &&
    slot !== 'bottom' &&
    slot !== 'left'
  ) {
    throw new Error(`Invalid slot: ${slot}`);
  }

  return slot;
}
