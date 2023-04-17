import { EventEmitter, InjectionToken } from '@angular/core';
import {
  BergPanelInputs as BergPanelInputsCore,
  BergPanelOutputs as BergPanelOutputsCore,
  BERG_PANEL_DEFAULT_INPUTS as BERG_PANEL_DEFAULT_INPUTS_CORE,
} from '@berg-layout/core';

/** Inputs of berg-panel. */
export type BergPanelInputs = BergPanelInputsCore;

/** Outputs of berg-panel. */
export type BergPanelOutputs = {
  [K in keyof BergPanelOutputsCore]: EventEmitter<
    BergPanelOutputsCore[K] extends CustomEvent<infer T> ? T : never
  >;
};

/** Injection token used to set the default berg-panel inputs. */
export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

export const BERG_PANEL_DEFAULT_INPUTS = BERG_PANEL_DEFAULT_INPUTS_CORE;

/** @deprecated - use the same interface in @berg-layout/core */
export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}
