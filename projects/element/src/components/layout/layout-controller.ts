import { arrayReducer } from '@berglund/rx';
import {
  asapScheduler,
  debounceTime,
  fromEvent,
  map,
  Observable,
  Subject,
} from 'rxjs';
import { BergLayoutSlot } from './layout-model';

export class BergLayoutController {
  private addSlotSub = new Subject<BergLayoutSlot>();
  private removeSlotSub = new Subject<BergLayoutSlot>();

  private slots$ = arrayReducer({
    add: this.addSlotSub,
    remove: this.removeSlotSub,
  });

  mousemove$ = fromEvent<MouseEvent>(this.layoutElem, 'mousemove');
  mousedown$ = fromEvent<MouseEvent>(this.layoutElem, 'mousedown');

  constructor(public layoutElem: HTMLElement) {}

  addSlot(slot: BergLayoutSlot): void {
    this.addSlotSub.next(slot);
  }

  removeSlot(slot: BergLayoutSlot): void {
    this.removeSlotSub.next(slot);
  }

  getResizable(slot: BergLayoutSlot): Observable<boolean> {
    return this.slots$.pipe(
      debounceTime(0, asapScheduler),
      map((slots) => {
        if (slot === 'top') {
          return slots.some(
            (s) => s === 'left' || s === 'right' || s === 'center'
          );
        }

        if (slot === 'right') {
          return slots.includes('center') || !slots.includes('left');
        }

        if (slot === 'center') {
          return false;
        }

        return true;
      })
    );
  }
}
