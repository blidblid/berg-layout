import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
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
import { BergPanelController } from '../panel/panel-controller';
import { BergPanelControllerStore } from '../panel/panel-controller-store';
import {
  BergLayoutElement,
  BergLayoutInputs,
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
  extends BergPanelController
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

  _hostClass: string;

  private destroySub = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(BERG_LAYOUT_INPUTS)
    @Optional()
    protected override inputs: BergLayoutInputs,
    private changeDetectorRef: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver,
    private elementRef: ElementRef<HTMLElement>,
    private panelControllerStore: BergPanelControllerStore
  ) {
    super(elementRef.nativeElement, document, inputs);
    this.panelControllerStore.add(this);
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

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
