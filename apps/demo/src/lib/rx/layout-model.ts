import { BergLayoutInputs, BergPanelInputs } from '@berg-layout/angular';
import { BergPanelSlot } from '@berg-layout/core';
import { Observable } from 'rxjs';

export interface Layout extends Partial<BergLayoutInputs> {
  top?: Panel;
  right?: Panel;
  bottom?: Panel;
  left?: Panel;
}

export type SlotWithInputs = Exclude<BergPanelSlot, 'center'>;

export interface Panel extends Partial<BergPanelInputs> {
  slot: SlotWithInputs;
  remove: boolean;
}

export type ObservableProperties<T> = {
  [P in keyof T]: Observable<T[P]>;
};
