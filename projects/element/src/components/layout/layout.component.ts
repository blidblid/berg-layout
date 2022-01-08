import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { BergCommonInputsBase } from '../input-base';
import {
  BergLayoutInputs,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_LAYOUT_INPUTS,
} from './layout-model';

@Component({
  selector: 'berg-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClass',
    '[class.berg-layout]': 'true',
  },
})
export class BergLayoutComponent extends BergCommonInputsBase {
  /** Mobile resolution breakpoint. */
  @Input()
  set mobileBreakpoint(value: string) {
    this.mobileBreakpointSub.next(value);
  }
  private mobileBreakpointSub = new BehaviorSubject<string>(
    this.getInput('mobileBreakpoint')
  );

  /** Small resolution breakpoint. */
  @Input()
  set smallBreakpoint(value: string) {
    this.smallBreakpointSub.next(value);
  }
  private smallBreakpointSub = new BehaviorSubject<string>(
    this.getInput('smallBreakpoint')
  );

  /** Medium resolution breakpoint. */
  @Input()
  set mediumBreakpoint(value: string) {
    this.mediumBreakpointSub.next(value);
  }
  private mediumBreakpointSub = new BehaviorSubject<string>(
    this.getInput('mediumBreakpoint')
  );

  _hostClass: string;

  private destroySub = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected override inputs: BergLayoutInputs
  ) {
    super(inputs);
    this.subscribe();
  }

  private hostClass$ = combineLatest([
    this.mobileBreakpointSub,
    this.smallBreakpointSub,
    this.mediumBreakpointSub,
  ]).pipe(
    map((breakpoints) => breakpoints.map(this.getBreakpoint)),
    switchMap(([mobile, small, medium]) => {
      return this.breakpointObserver
        .observe(
          [mobile, small, medium].filter(
            (breakpoint): breakpoint is string => !!breakpoint
          )
        )
        .pipe(
          map((state) => {
            if (state.breakpoints[mobile]) {
              return 'berg-layout-mobile';
            } else if (state.breakpoints[small]) {
              return 'berg-layout-small';
            } else if (state.breakpoints[medium]) {
              return 'berg-layout-medium';
            }

            return 'berg-layout-large';
          })
        );
    })
  );

  private getBreakpoint(breakpoint?: string): string {
    return breakpoint ? `(max-width: ${breakpoint})` : '';
  }

  private subscribe(): void {
    this.hostClass$.pipe(takeUntil(this.destroySub)).subscribe((hostClass) => {
      this._hostClass = hostClass;
      this.changeDetectorRef.markForCheck();
    });
  }

  private getInput<T extends keyof BergLayoutInputs>(
    input: T
  ): BergLayoutInputs[T] {
    return this.inputs ? this.inputs[input] : BERG_LAYOUT_DEFAULT_INPUTS[input];
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
