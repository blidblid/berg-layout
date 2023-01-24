import { InjectionToken } from '@angular/core';

export interface BergLayoutElement {
  hostElem: HTMLElement;
}

export const BERG_LAYOUT_ELEMENT = new InjectionToken<BergLayoutElement>(
  'BERG_LAYOUT_ELEMENT'
);
