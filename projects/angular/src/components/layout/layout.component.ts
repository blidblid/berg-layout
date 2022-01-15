import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Input,
  OnDestroy,
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
import { BergCommonInputsBase } from '../../core';
import {
  BergLayoutElement,
  BergLayoutInputs,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_LAYOUT_ELEMENT,
  BERG_LAYOUT_INPUTS,
} from './layout-model';

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
    '[class]': '_hostClass',
    '[class.berg-layout]': 'true',
  },
})
export class BergLayoutComponent
  extends BergCommonInputsBase
  implements BergLayoutInputs, BergLayoutElement, OnDestroy
{
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

  /** Threshold to determine if a cursor position should be able to resize the element. */
  @Input()
  get resizeThreshold() {
    return this._resizeThreshold;
  }
  set resizeThreshold(value: number) {
    this._resizeThreshold = value;
  }
  private _resizeThreshold: number;

  /** Ratio to determine what resize event that should be interpreted as a collapsing event. */
  @Input()
  get resizeCollapseRatio() {
    return this._resizeCollapseRatio;
  }
  set resizeCollapseRatio(value: number) {
    this._resizeCollapseRatio = value;
  }
  private _resizeCollapseRatio: number;

  /** Delay before the resize preview is shown. */
  @Input()
  get resizePreviewDelay() {
    return this._resizePreviewDelay;
  }
  set resizePreviewDelay(value: number) {
    this._resizePreviewDelay = value;
  }
  private _resizePreviewDelay: number;

  /** Delay before the resize preview is shown. */
  @Input()
  get resizeTwoDimensions() {
    return this._resizeTwoDimensions;
  }
  set resizeTwoDimensions(value: boolean) {
    this._resizeTwoDimensions = coerceBooleanProperty(value);
  }
  private _resizeTwoDimensions: boolean;

  /** Whether resizing is disabled. */
  @Input()
  get resizeDisabled() {
    return this._resizeDisabled;
  }
  set resizeDisabled(value: boolean) {
    this._resizeDisabled = coerceBooleanProperty(value);
  }
  private _resizeDisabled: boolean;

  _hostClass: string;

  private destroySub = new Subject<void>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    protected override injector: Injector,
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected override inputs: BergLayoutInputs
  ) {
    super(injector, inputs);
    this.controller.layoutInputs = this;
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
