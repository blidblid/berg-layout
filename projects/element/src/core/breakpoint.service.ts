import { BreakpointObserver } from '@angular/cdk/layout';
import { Inject, Injectable, Optional } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { BergLayoutBreakpoints, BERG_LAYOUT_DEFAULT_BREAKPOINTS } from '.';
import { BERG_LAYOUT_BREAKPOINTS } from './breakpoint-model';

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  mobileBreakpoint = this.getBreakpoint('mobile');
  smallBreakpoint = this.getBreakpoint('small');
  mediumBreakpoint = this.getBreakpoint('medium');

  matches$ = this.breakpointObserver
    .observe([
      this.mobileBreakpoint,
      this.smallBreakpoint,
      this.mediumBreakpoint,
    ])
    .pipe(shareReplay(1));

  constructor(
    private breakpointObserver: BreakpointObserver,
    @Optional()
    @Inject(BERG_LAYOUT_BREAKPOINTS)
    private breakpoints: BergLayoutBreakpoints | null
  ) {}

  private getBreakpoint(breakpoint: keyof BergLayoutBreakpoints): string {
    return `(max-width: ${
      (this.breakpoints || BERG_LAYOUT_DEFAULT_BREAKPOINTS)[breakpoint]
    })`;
  }
}
