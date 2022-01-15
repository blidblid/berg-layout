import { Injectable } from '@angular/core';
import { BergPanelController } from './panel-controller';

@Injectable({ providedIn: 'root' })
export class BergPanelControllerStore {
  private controllers = new WeakMap<HTMLElement, BergPanelController>();

  add(controller: BergPanelController): void {
    this.controllers.set(controller.hostElem, controller);
  }

  get(layoutElement: HTMLElement): BergPanelController {
    const controller = this.controllers.get(layoutElement);

    if (!controller) {
      throw new Error('Could not find a panel controller.');
    }

    return controller;
  }
}
