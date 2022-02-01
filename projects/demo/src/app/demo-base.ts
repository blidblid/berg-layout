import { BreakpointObserver } from '@angular/cdk/layout';
import { Directive } from '@angular/core';
import { EditorView } from '@demo/components';
import { LayoutRx, Slot } from '@demo/rx';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Directive()
export class DemoBase {
  view: EditorView = 'none';

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
    protected rx: LayoutRx,
    protected breakpointObserver: BreakpointObserver
  ) {
    this.subscribe();
  }

  onBackdropClicked(slot: Slot): void {
    this.rx[slot].collapsed.next(true);
  }

  onResizeSnapped(slot: Slot, resizeSnap: any): void {
    this.rx[slot].resizeSnap.next(
      resizeSnap instanceof CustomEvent ? resizeSnap.detail : resizeSnap
    );
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
