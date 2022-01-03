import { arrayReducer } from '@berglund/rx';
import {
  debounceTime,
  fromEvent,
  map,
  merge,
  Observable,
  share,
  Subject,
  switchMap,
} from 'rxjs';
import { BergPanel, BergPanelSlot } from './panel-model';

export class BergPanelController {
  private addSub = new Subject<BergPanel>();
  private pushSub = new Subject<void>();
  private removeSub = new Subject<BergPanel>();

  private panels$ = arrayReducer({
    add: this.addSub,
    push: this.pushSub,
    remove: this.removeSub,
  }).pipe(debounceTime(0), share());

  slotIsResizable$ = this.panels$.pipe(
    map((panels) => {
      return (panelSlot: BergPanelSlot) => {
        const expandedAbsolutePanels = panels.filter(
          (panel) => panel.absolute && !panel.collapsed
        );

        if (expandedAbsolutePanels.length > 0) {
          return expandedAbsolutePanels.some(({ slot }) => slot === panelSlot);
        }

        if (panelSlot === 'right') {
          return (
            panels.some(({ slot }) => slot === 'center') ||
            panels.every(({ slot }) => slot !== 'left')
          );
        }

        if (panelSlot === 'center') {
          return false;
        }

        return true;
      };
    }),
    share()
  );

  private panelsEvents: Record<string, Observable<any>> = {};

  constructor(public layoutElement: HTMLElement) {}

  add(panel: BergPanel): void {
    this.addSub.next(panel);
  }

  push(): void {
    this.pushSub.next();
  }

  remove(panel: BergPanel): void {
    this.removeSub.next(panel);
  }

  fromLayoutEvent<T extends Event>(eventName: string): Observable<T> {
    return fromEvent<T>(this.layoutElement, eventName);
  }

  fromPanelsEvent<T extends Event>(eventName: string): Observable<T> {
    if (!this.panelsEvents[eventName]) {
      this.panelsEvents[eventName] = this.panels$.pipe(
        switchMap((panels) => {
          return merge(
            ...panels.map((panel) => fromEvent<T>(panel.hostElem, eventName))
          );
        })
      );
    }

    return this.panelsEvents[eventName];
  }
}
