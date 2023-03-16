import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Breakpoints {
  private tiny = this.getBreakpoint('700px');
  private small = this.getBreakpoint('900px');
  private medium = this.getBreakpoint('1100px');
  private large = this.getBreakpoint('1300px');

  breakpoints$ = this.breakpointObserver
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

  constructor(private breakpointObserver: BreakpointObserver) {}

  private getBreakpoint(breakpoint?: string): string {
    return breakpoint ? `(max-width: ${breakpoint})` : '';
  }
}
