import { BergLayoutInputs, BergPanelInputs } from '@berg-layout/angular';
import { Observable } from 'rxjs';

export interface Layout extends Partial<BergLayoutInputs> {
  top?: Panel;
  right?: Panel;
  bottom?: Panel;
  left?: Panel;
}

export type Slot = 'top' | 'right' | 'bottom' | 'left';

export interface Panel extends Partial<BergPanelInputs> {
  slot: Slot;
  remove: boolean;
}

export type ObservableProperties<T> = {
  [P in keyof T]: Observable<T[P]>;
};
