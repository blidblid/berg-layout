export interface BergPanel {
  slot: BergPanelSlot;
  absolute: boolean;
  collapsed: boolean;
  hostElem: HTMLElement;
}

export type BergPanelSlot = 'top' | 'left' | 'bottom' | 'right' | 'center';

export interface BergPanelBreakpoints {
  mobile: string;
  small: string;
  medium: string;
}
