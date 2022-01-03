export interface BergPanel {
  slot: BergPanelSlot;
  hostElem: HTMLElement;
  absolute: boolean;
  collapsed: boolean;
}

export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';
