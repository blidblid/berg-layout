import { Injectable } from '@angular/core';
import { BergLayoutController } from './layout-controller';

@Injectable({ providedIn: 'root' })
export class BergLayoutControllerFactory {
  private controllers = new WeakMap<HTMLElement, BergLayoutController>();

  get(element: HTMLElement): BergLayoutController {
    const cachedController = this.controllers.get(element);

    if (cachedController) {
      return cachedController;
    }

    const controller = new BergLayoutController(element);
    this.controllers.set(element, controller);

    return controller;
  }
}
