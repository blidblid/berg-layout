import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
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
import { BodyListeners } from '../resize/body-listeners';
import { BergResizeInputs, BERG_RESIZE_INPUTS } from '../resize/resize-model';

@Component({
  selector: 'berg-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '_hostClass',
    '[class.berg-panel]': 'true',
    '[class.berg-panel-absolute]': '_absolute',
    '[class.berg-panel-hidden]': '_hidden',
    '[class.berg-panel-vertical]': 'slot === "left" || slot === "right"',
    '[class.berg-panel-horizontal]': 'slot === "top" || slot === "bottom"',
    '[class.berg-panel-center]': '!slot',
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
    '[style.margin]': '_margin',
    '(transitionend)': '_onTransitionend()',
  },
})
export class BergPanelComponent extends BergResizeDirective {
  /** Whether the panel is absolutely positioned. */
  @Input()
  set absolute(value: boolean) {
    this._absolute = coerceBooleanProperty(value);
  }
  _absolute: boolean;

  /** Whether the panel is collapsed. */
  @Input()
  set collapsed(value: boolean) {
    this._collapsed = coerceBooleanProperty(value);

    if (this._collapsed && !this._init) {
      this._hidden = true;
      return;
    } else {
      this._hidden = false;
    }

    if (this._collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  _hidden: boolean;
  _collapsed: boolean;

  _margin: string | null;
  _hostClass: string;
  _layoutElement: HTMLElement;
  _init: boolean;

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
    protected override bodyListeners: BodyListeners,
    protected override elementRef: ElementRef<HTMLElement>,
    protected override viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(BERG_RESIZE_INPUTS)
    @Optional()
    protected override inputs: BergResizeInputs,
    private listenerCache: ListenerCacheService,
    private breakpoint: BreakpointService,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone
  ) {
    super(bodyListeners, elementRef, viewContainerRef, document, inputs);
    this._layoutElement = this.findLayoutElement();
    this.subscribe();

    // Life cycle hooks are bugged out in @angular/elements.
    this.zone.runOutsideAngular(() => {
      Promise.resolve().then(() => (this._init = true));
    });
  }

  collapse(): void {
    if (!this.slot) {
      return;
    }

    const { width, height } = this.hostElem.getBoundingClientRect();

    if ((this.slot = 'left')) {
      this._margin = `0 0 0 -${width}px`;
    } else if (this.slot === 'right') {
      this._margin === `0 -${width}px 0 0`;
    } else if (this.slot === 'top') {
      this._margin === `-${height}px 0 0 0`;
    } else {
      this._margin === `0 0 -${height}px 0`;
    }
  }

  expand(): void {
    if (!this.slot) {
      return;
    }

    requestAnimationFrame(() => {
      this._margin = null;
      this.changeDetectorRef.markForCheck();
    });
  }

  _onTransitionend() {
    if (this._collapsed) {
      this._hidden = true;
    }
  }

  protected override getMousedown(): Observable<MouseEvent> {
    return defer(() => {
      return this.listenerCache.getMousedown(this._layoutElement, () => {
        return fromEvent<MouseEvent>(this._layoutElement, 'mousedown');
      });
    });
  }

  protected override getMousemove(): Observable<MouseEvent> {
    return defer(() => {
      return this.listenerCache.getMousemove(this._layoutElement, () => {
        return fromEvent<MouseEvent>(this._layoutElement, 'mousemove').pipe(
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
      this._hostClass = hostClass;
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
          this._layoutElement.classList.add(resizeClass);
        } else {
          this._layoutElement.classList.remove(resizeClass);
        }
      });
  }
}
