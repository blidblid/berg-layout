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
   * Controls how panel events update panel attributes.
   * With "auto", panel events automatically update panel attributes.
   * With "none", panel events never update panel attributes.
   */
  'event-binding-mode': BergPanelEventBindingMode;
}

export type BergPanelAttribute = keyof BergPanelAttributes;

/** Outputs that panels emit. */
export interface BergPanelOutputs {
  /** Emits when a user resizes the panel. */
  resized: Observable<BergPanelResizeEvent>;

  /** Emits whenever a user clicks a panel backdrop. */
  backdropClicked: Observable<MouseEvent>;
}

/** Binding modes that controls how events automatically update attributes. */
export type BergPanelEventBindingMode = 'auto' | 'none';

export interface BergPanelResizeEvent {
  event: MouseEvent;
  size: number;
}

// prefer picking properties since those properties includes documentation
export interface BergPanelAttributesCamelCased
  extends Pick<
    BergPanelAttributes,
    'slot' | 'absolute' | 'collapsed' | 'size'
  > {
  /** Whether resizing is disabled. */
  resizeDisabled: BergPanelAttributes['resize-disabled'];

  /** Min size of the panel */
  minSize: BergPanelAttributes['min-size'];

  /** Max size of the panel */
  maxSize: BergPanelAttributes['max-size'];

  /**
   * Controls how panel events update panel attributes.
   * With "auto", panel events automatically update panel attributes.
   * With "none", panel events never update panel attributes.
   */
  eventBindingMode: BergPanelAttributes['event-binding-mode'];
}
