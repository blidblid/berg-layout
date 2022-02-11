import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { pairwise, startWith, Subject, takeUntil } from 'rxjs';
import { BergPanelController } from '../panel/panel-controller';
import { BergPanelControllerStore } from '../panel/panel-controller-store';
import { BergLayoutInputs, BERG_LAYOUT_INPUTS } from './layout-model';
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
  implements BergLayoutInputs, BergLayoutElement, OnDestroy
{
  @ViewChild('flexContainer', { read: ElementRef })
  private flexContainerRef: ElementRef<HTMLElement>;

  /** Flex container element containing the left and the right panel. */
  get flexContainer() {
    return this.flexContainerRef.nativeElement;
  }

  @ViewChild('innerFlexContainer', { read: ElementRef })
  private innerFlexContainerRef: ElementRef<HTMLElement>;

  /** Flex container element containing the center panel. */
  get innerFlexContainer() {
    return this.innerFlexContainerRef.nativeElement;
  }

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
    this.subscribe();
  }

  private subscribe(): void {
    this.getResizeToggleForFlexContainer()
      .pipe(startWith(null), pairwise(), takeUntil(this.destroySub))
      .subscribe(([previous, elem]) => {
        if (previous && !elem) {
          this.flexContainer.removeChild(previous);
        }

        if (elem) {
          this.flexContainer.appendChild(elem);
        }
      });

    this.getResizeToggleForInnerFlexContainer()
      .pipe(takeUntil(this.destroySub))
      .subscribe((elem) => {
        if (elem) {
          this.innerFlexContainer.appendChild(elem);
        }
      });
  }

  /** @hidden */
  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
