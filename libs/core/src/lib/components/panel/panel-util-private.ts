import { BergPanelOutputBindingMode, BergPanelSlot } from './panel-model';

export function validateOutputBindingMode(
  mode: string
): BergPanelOutputBindingMode {
  if (mode !== 'auto' && mode !== 'noop') {
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
