import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Optional,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { map } from 'rxjs/operators';
import { BreakpointService } from '../../core';
import { BergResizeDirective } from '../resize';
import { BergResizeInputs, BERG_RESIZE_INPUTS } from '../resize/resize-model';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass',
    '[class.berg-panel]': 'true',
    '[class.berg-panel-center]': '!slot',
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
  },
})
export class BergPanelComponent extends BergResizeDirective {
  hostClass: string;

  private hostClass$ = this.breakpoint.matches$.pipe(
    map((breakpoint) => {
      if (breakpoint.breakpoints[this.breakpoint.mobileBreakpoint]) {
        return 'berg-panel-mobile';
      } else if (breakpoint.breakpoints[this.breakpoint.smallBreakpoint]) {
        return 'berg-panel-small';
      } else if (breakpoint.breakpoints[this.breakpoint.mediumBreakpoint]) {
        return 'berg-panel-medium';
      }

      return 'berg-panel-large';
    })
  );

  constructor(
    protected override elementRef: ElementRef<HTMLElement>,
    protected override viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(BERG_RESIZE_INPUTS)
    @Optional()
    protected override inputs: BergResizeInputs,
    private breakpoint: BreakpointService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef, viewContainerRef, document, inputs);

    this.hostClass$.subscribe((hostClass) => {
      this.hostClass = hostClass;
      this.changeDetectorRef.markForCheck();
    });
  }

  override ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
