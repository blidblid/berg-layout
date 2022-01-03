import { Injectable } from '@angular/core';
import { BergPanelController } from './panel-controller';

@Injectable({ providedIn: 'root' })
export class BergPanelControllerFactory {
  private controllers = new WeakMap<HTMLElement, BergPanelController>();

  get(layoutElement: HTMLElement): BergPanelController {
    const cachedController = this.controllers.get(layoutElement);

    if (cachedController) {
      return cachedController;
    }

    const controller = new BergPanelController(layoutElement);
    this.controllers.set(layoutElement, controller);

    return controller;
  }
}
