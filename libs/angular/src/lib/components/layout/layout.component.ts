import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { BergPanelController } from '../panel/panel-controller';
import { BergPanelControllerStore } from '../panel/panel-controller-store';
import {
  BergLayoutComponentInputs,
  BergLayoutInputs,
  BERG_LAYOUT_INPUTS,
} from './layout-model';
import { BergLayoutElement, BERG_LAYOUT_ELEMENT } from './layout-model-private';

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
  implements BergLayoutComponentInputs, BergLayoutElement, OnDestroy
{
  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected override inputs: BergLayoutInputs,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected elementRef: ElementRef<HTMLElement>,
    private panelControllerStore: BergPanelControllerStore
  ) {
    super(elementRef.nativeElement, changeDetectorRef, document, inputs);
    this.panelControllerStore.add(this);
  }
}
