export interface BergPanel {
  slot: BergPanelSlot;
  absolute: boolean;
  collapsed: boolean;
  hostElem: HTMLElement;
}

export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';
