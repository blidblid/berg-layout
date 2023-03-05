/** Slots where panels can be inserted. */
export type BergPanelSlot = 'top' | 'right' | 'bottom' | 'left';

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
   * Controls how panel events update panel inputs.
   * With "auto", panel events automatically update panel inputs.
   * With "none", panel events never update panel inputs.
   */
  eventBindingMode: BergPanelEventBindingMode;
}

export type BergPanelInput = keyof BergPanelInputs;

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes the panel. */
  resized: CustomEvent<BergPanelResizeEvent>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: CustomEvent<MouseEvent>;

  /** Emits when a panel has finished collapsing. */
  afterCollapsed: CustomEvent<void>;

  /** Emits when a panel has finished expanding. */
  afterExpanded: CustomEvent<void>;
}

/** Binding modes that controls how events automatically update attributes. */
export type BergPanelEventBindingMode = 'auto' | 'none';

export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}
