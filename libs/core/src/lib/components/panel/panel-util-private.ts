import { BergPanelEventBindingMode, BergPanelSlot } from './panel-model';

export function validateOutputBindingMode(
  mode: string
): BergPanelEventBindingMode {
  if (mode !== 'auto' && mode !== 'none') {
    throw new Error(`Invalid output binding mode: ${mode}`);
  }

  return mode;
}

export function validateSlot(slot: string): BergPanelSlot {
  if (
    slot !== 'center' &&
    slot !== 'top' &&
    slot !== 'right' &&
    slot !== 'bottom' &&
    slot !== 'left'
  ) {
    throw new Error(`Invalid slot: ${slot}`);
  }

  return slot;
}
