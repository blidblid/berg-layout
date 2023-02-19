import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { BergPanelResizeEvent, BergPanelSlot } from '@berg-layout/core';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';
import { EditorView } from '../../lib/components';
import { LayoutRx } from '../../lib/rx';
import { CodePrinter } from '../code';

@Component({
  templateUrl: './demo.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoComponent implements OnDestroy {
  view: EditorView = 'code';

  topSize = 80;
  bottomSize = 49;

  html$ = combineLatest([
    this.rx.layout$,
    this.rx.top$,
    this.rx.right$,
    this.rx.bottom$,
    this.rx.left$,
  ]).pipe(
    map(([layout, top, right, bottom, left]) => {
      return this.codePrinter.printHtml(layout, { top, right, bottom, left });
    })
  );

  private collapsePanelAtSize = 25;
  private initialLeftSize = 55;
  private expandedLeftSize = 160;

  leftSize = this.initialLeftSize;

  private tiny = this.getBreakpoint('700px');
  private small = this.getBreakpoint('900px');
  private medium = this.getBreakpoint('1100px');
  private large = this.getBreakpoint('1300px');

  private breakpoints$ = this.breakpointObserver
    .observe(
      [this.tiny, this.small, this.medium, this.large].filter(
        (breakpoint): breakpoint is string => !!breakpoint
      )
    )
    .pipe(
      map((state) => {
        return {
          tiny: state.breakpoints[this.tiny],
          small: state.breakpoints[this.small],
          medium: state.breakpoints[this.medium],
          large: state.breakpoints[this.large],
          huge: !state.breakpoints[this.large],
        };
      })
    );

  private destroySub = new Subject<void>();

  constructor(
    protected codePrinter: CodePrinter,
    protected rx: LayoutRx,
    protected breakpointObserver: BreakpointObserver
  ) {
    this.subscribe();
  }

  onResized(slot: BergPanelSlot, event: BergPanelResizeEvent | Event): void {
    const resizeEvent = event instanceof CustomEvent ? event.detail : event;

    if (resizeEvent.size < this.collapsePanelAtSize) {
      this.rx[slot].collapsed.next(true);
    } else if (resizeEvent.size > this.collapsePanelAtSize) {
      this.rx[slot].collapsed.next(false);
    }

    if (slot !== 'left') {
      return;
    }

    if (resizeEvent.size > this.expandedLeftSize) {
      this.leftSize = this.expandedLeftSize;
    } else {
      this.leftSize = this.initialLeftSize;
    }
  }

  onBackdropClicked(slot: BergPanelSlot): void {
    this.rx[slot].collapsed.next(true);
  }

  private subscribe(): void {
    this.breakpoints$
      .pipe(takeUntil(this.destroySub))
      .subscribe((breakpoints) => {
        this.rx.left.collapsed.next(breakpoints.tiny);
        this.rx.right.collapsed.next(breakpoints.medium);
        this.rx.bottom.collapsed.next(!breakpoints.tiny);
      });
  }

  private getBreakpoint(breakpoint?: string): string {
    return breakpoint ? `(max-width: ${breakpoint})` : '';
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}