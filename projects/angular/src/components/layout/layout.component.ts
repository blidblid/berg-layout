import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { Subject } from 'rxjs';
import { BergPanelController } from '../panel/panel-controller';
import { BergPanelControllerStore } from '../panel/panel-controller-store';
import {
  BergLayoutElement,
  BergLayoutInputs,
  BERG_LAYOUT_ELEMENT,
  BERG_LAYOUT_INPUTS,
} from './layout-model';

@Component({
  selector: 'berg-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: BERG_LAYOUT_ELEMENT, useExisting: BergLayoutComponent },
  ],
  host: {
    class: 'berg-layout',
  },
})
export class BergLayoutComponent
  extends BergPanelController
  implements BergLayoutInputs, BergLayoutElement, OnDestroy
{
  private destroySub = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected override inputs: BergLayoutInputs,
    protected elementRef: ElementRef<HTMLElement>,
    private panelControllerStore: BergPanelControllerStore
  ) {
    super(elementRef.nativeElement, document, inputs);
    this.panelControllerStore.add(this);
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
