import { Directive, ElementRef, InjectFlags, Injector } from '@angular/core';
import { BERG_LAYOUT_ELEMENT } from '..';
import { BergPanelControllerFactory } from '../components/panel/panel-controller-factory';
import { BergSharedInputs } from './shared-inputs-model';

@Directive()
export class BergCommonInputsBase {
  private controllerFactory = this.injector.get(BergPanelControllerFactory);
  private elementRef = this.injector.get(ElementRef);

  protected controller = this.controllerFactory.get(this.findLayoutElement());
  protected layoutElement: HTMLElement;

  get hostElem() {
    return this.elementRef.nativeElement;
  }

  constructor(
    protected injector: Injector,
    protected inputs: BergSharedInputs
  ) {}

  protected getLayoutElement(): HTMLElement {
    if (!this.layoutElement) {
      this.layoutElement = this.findLayoutElement();
    }

    return this.layoutElement;
  }

  private findLayoutElement(): HTMLElement {
    if (this.hostElem.tagName === LAYOUT_TAGNAME) {
      return this.hostElem;
    }

    const injected = this.injector.get(
      BERG_LAYOUT_ELEMENT,
      null,
      InjectFlags.SkipSelf
    );

    if (injected) {
      return injected.hostElem;
    }

    let elem = this.hostElem;

    while (elem) {
      if (elem.tagName === LAYOUT_TAGNAME) {
        return elem;
      }

      elem = elem.parentElement;
    }

    const queried: HTMLElement | null = document.querySelector('berg-layout');

    if (queried) {
      return queried;
    }

    throw new Error('<berg-panel> could not find a <berg-layout> element');
  }
}

const LAYOUT_TAGNAME = 'BERG-LAYOUT';
