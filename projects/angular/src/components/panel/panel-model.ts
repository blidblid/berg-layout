import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BergPanelOutputBindingMode } from './panel-output-bindings';

/** Slots where panels can be inserted. */
export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';

/** Inputs of berg-panel. */
export interface BergPanelInputs {
  /** Name of the content projection slot. */
  slot: BergPanelSlot;

  /** Whether the panel is absolutely positioned. */
  absolute: boolean;

  /** Whether the panel is collapsed. */
  collapsed: boolean;

  /** Whether resizing is disabled. */
  resizeDisabled: boolean;

  /** Snap location. */
  snap: BergPanelSnap;

  /**
   * Controls how panel outputs update panel inputs.
   * With auto, panel outputs automatically update panel inputs.
   * With noop, panel outputs never updates panel inputs.
   */
  outputBindingMode: BergPanelOutputBindingMode;
}

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes beyond where the panel changes its size. */
  snapped: Observable<BergPanelSnap>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: Observable<MouseEvent>;
}

/** Default inputs of berg-panel. */
export const BERG_PANEL_DEFAULT_INPUTS: BergPanelInputs = {
  slot: 'center',
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  snap: 'none',
  outputBindingMode: 'auto',
};

/** Injection token used to set the default berg-panel inputs. */
export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

/** Snap states of berg-panel. */
export type BergPanelSnap = 'collapsed' | 'expanded' | 'none';
