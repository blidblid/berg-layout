import { InjectionToken } from '@angular/core';
import {
  BergPanelInputs as BergPanelInputsCore,
  BERG_PANEL_DEFAULT_INPUTS as BERG_PANEL_DEFAULT_INPUTS_CORE,
} from '@berg-layout/core';
import { Observable } from 'rxjs';

/** Inputs of berg-panel. */
export type BergPanelInputs = BergPanelInputsCore;

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes the panel. */
  resized: Observable<BergPanelResizeEvent>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: Observable<MouseEvent>;
}

/** Injection token used to set the default berg-panel inputs. */
export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

export const BERG_PANEL_DEFAULT_INPUTS = BERG_PANEL_DEFAULT_INPUTS_CORE;

export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}
