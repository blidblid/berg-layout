import { Observable } from 'rxjs';

/** Slots where panels can be inserted. */
export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';

/** Attributes of berg-panel. */
export interface BergPanelAttributes {
  /** Name of the content projection slot. */
  slot: BergPanelSlot;

  /** Whether the panel is absolutely positioned. */
  absolute: boolean;

  /** Whether the panel is collapsed. */
  collapsed: boolean;

  /** Whether resizing is disabled. */
  'resize-disabled': boolean;

  /** Size of the panel. */
  size: number;

  /** Min size of the panel */
  'min-size': number | null;

  /** Max size of the panel. */
  'max-size': number | null;

  /**
   * Controls how panel outputs update panel inputs.
   * With "auto", panel outputs automatically update panel inputs.
   * With "noop", panel outputs never update panel inputs.
   */
  'output-binding-mode': BergPanelOutputBindingMode;
}

export type BergPanelAttribute = keyof BergPanelAttributes;

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes the panel. */
  resized: Observable<BergPanelResizeEvent>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: Observable<MouseEvent>;
}

/** Default inputs of berg-panel. */
export const BERG_PANEL_DEFAULTS: BergPanelAttributes = {
  slot: 'center',
  absolute: false,
  collapsed: false,
  'resize-disabled': false,
  'output-binding-mode': 'auto',
  size: 100,
  'min-size': 50,
  'max-size': null,
};

/** Binding modes that controls how outputs update inputs. */
export type BergPanelOutputBindingMode = 'auto' | 'noop';

export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}
