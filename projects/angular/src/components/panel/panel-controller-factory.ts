import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BergPanelController } from './panel-controller';

@Injectable({ providedIn: 'root' })
export class BergPanelControllerFactory {
  private controllers = new WeakMap<HTMLElement, BergPanelController>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  get(layoutElement: HTMLElement): BergPanelController {
    const cachedController = this.controllers.get(layoutElement);

    if (cachedController) {
      return cachedController;
    }

    const controller = new BergPanelController(layoutElement, this.document);
    this.controllers.set(layoutElement, controller);

    return controller;
  }
}
