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
import { animationFrameScheduler, defer, fromEvent, Observable } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { BreakpointService } from '../../core';
import { BergResizeDirective } from '../resize';
import { BergResizeInputs, BERG_RESIZE_INPUTS } from '../resize/resize-model';
import { BERG_PANEL_MOUSE_MOVE_DEBOUNCE } from './panel-model';

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
  layoutElement: HTMLElement;

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

    this.subscribeToHostClass();
    this.findLayoutElement();
  }

  protected override getMouseDown(): Observable<MouseEvent> {
    return defer(() => {
      return fromEvent<MouseEvent>(this.layoutElement, 'mousedown');
    });
  }

  protected override getMouseMove(): Observable<MouseEvent> {
    return defer(() => {
      return fromEvent<MouseEvent>(this.layoutElement, 'mousemove').pipe(
        debounceTime(BERG_PANEL_MOUSE_MOVE_DEBOUNCE, animationFrameScheduler)
      );
    });
  }

  private findLayoutElement(): void {
    let elem = this.elementRef.nativeElement;

    while (elem.parentElement) {
      if (elem.parentElement.tagName === 'BERG-LAYOUT') {
        this.layoutElement = elem.parentElement;
        return;
      }

      elem = elem.parentElement;
    }
  }

  private subscribeToHostClass(): void {
    this.hostClass$.pipe(takeUntil(this.destroySub)).subscribe((hostClass) => {
      this.hostClass = hostClass;
      this.changeDetectorRef.markForCheck();
    });
  }

  override ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
