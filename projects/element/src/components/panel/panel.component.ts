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
import {
  animationFrameScheduler,
  combineLatest,
  defer,
  fromEvent,
  Observable,
} from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { BreakpointService, ListenerCacheService } from '../../core';
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
    private listenerCache: ListenerCacheService,
    private breakpoint: BreakpointService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(elementRef, viewContainerRef, document, inputs);

    this.layoutElement = this.findLayoutElement();
    this.subscribe();
  }

  protected override getMousedown(): Observable<MouseEvent> {
    return defer(() => {
      return this.listenerCache.getMousedown(this.layoutElement, () => {
        return fromEvent<MouseEvent>(this.layoutElement, 'mousedown');
      });
    });
  }

  protected override getMousemove(): Observable<MouseEvent> {
    return defer(() => {
      return this.listenerCache.getMousemove(this.layoutElement, () => {
        return fromEvent<MouseEvent>(this.layoutElement, 'mousemove').pipe(
          debounceTime(0, animationFrameScheduler)
        );
      });
    });
  }

  private findLayoutElement(): HTMLElement {
    let elem = this.elementRef.nativeElement;

    while (elem.parentElement) {
      if (elem.parentElement.tagName === 'BERG-LAYOUT') {
        return elem.parentElement;
      }

      elem = elem.parentElement;
    }

    return this.hostElem;
  }

  private subscribe(): void {
    this.hostClass$.pipe(takeUntil(this.destroySub)).subscribe((hostClass) => {
      this.hostClass = hostClass;
      this.changeDetectorRef.markForCheck();
    });

    combineLatest([this.previewing$, this.resizing$])
      .pipe(takeUntil(this.destroySub))
      .subscribe(([previewing, resizing]) => {
        const resizeClass =
          this.position === 'above' || this.position === 'below'
            ? 'berg-layout-resize-vertical'
            : 'berg-layout-resize-horizontal';

        if (previewing || resizing) {
          this.layoutElement.classList.add(resizeClass);
        } else {
          this.layoutElement.classList.remove(resizeClass);
        }
      });
  }

  override ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
