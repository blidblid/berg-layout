import { InjectionToken } from '@angular/core';
import { BergPanelSlot } from '@berg-layout/core';
import { Observable } from 'rxjs';

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

  /** Size of the panel. */
  size: number;

  /** Min size of the panel */
  minSize: number | null;

  /** Max size of the panel. */
  maxSize: number | null;

  /**
   * Controls how panel outputs update panel inputs.
   * With "auto", panel outputs automatically update panel inputs.
   * With "noop", panel outputs never update panel inputs.
   */
  outputBindingMode: BergPanelOutputBindingMode;
}

export type BergPanelNullableInputs = {
  [P in keyof BergPanelInputs]: BergPanelInputs[P] | null;
};

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes the panel. */
  resized: Observable<BergPanelResizeEvent>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: Observable<MouseEvent>;
}

/** Default inputs of berg-panel. */
export const BERG_PANEL_DEFAULT_INPUTS: BergPanelInputs = {
  slot: 'center',
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  outputBindingMode: 'auto',
  size: 100,
  minSize: 50,
  maxSize: null,
};

/** Injection token used to set the default berg-panel inputs. */
export const BERG_PANEL_INPUTS = new InjectionToken<BergPanelInputs>(
  'BERG_PANEL_INPUTS'
);

/** Binding modes that controls how outputs update inputs. */
export type BergPanelOutputBindingMode = 'auto' | 'noop';

export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}
