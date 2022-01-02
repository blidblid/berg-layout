import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Optional,
  Output,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, fromEvent } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BodyListeners, BreakpointService } from '../../core';
import { BergLayoutControllerFactory } from '../layout';
import {
  BergResizeBase,
  BergResizeInputs,
  BERG_RESIZE_INPUTS,
} from '../resize';

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
    '[class.berg-panel-top]': 'slot === "top"',
    '[class.berg-panel-left]': 'slot === "left"',
    '[class.berg-panel-right]': 'slot === "right"',
    '[class.berg-panel-bottom]': 'slot === "bottom"',
    '[class.berg-panel-center]': 'slot === "center"',
    '[style.margin]': '_margin',
    '(transitionend)': '_onTransitionend()',
  },
})
export class BergPanelComponent extends BergResizeBase {
  /** Whether the panel is absolutely positioned. */
  @Input()
  set absolute(value: boolean) {
    this._absolute = coerceBooleanProperty(value);
    this.updateBackdrop();
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

    this.updateBackdrop();

    if (this._collapsed) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  _hidden: boolean;
  _collapsed: boolean;

  /** Emits whenever a user clicks a panel backdrop. */
  @Output() backdropClicked = new EventEmitter<void>();

  _margin: string | null;
  _hostClass: string;
  _layoutElement: HTMLElement;
  _backdropElement: HTMLElement;
  _init: boolean;
  _controller = this.controllerFactory.get(this.findLayoutParentElement());

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
    private controllerFactory: BergLayoutControllerFactory,
    private breakpoint: BreakpointService,
    private changeDetectorRef: ChangeDetectorRef,
    private zone: NgZone
  ) {
    super(bodyListeners, elementRef, viewContainerRef, document, inputs);
    this._layoutElement = this.findLayoutParentElement();
    this._controller.addSlot(this.slot);
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

  private findLayoutParentElement(): HTMLElement {
    if (this._layoutElement) {
      return this._layoutElement;
    }

    let elem = this.elementRef.nativeElement;

    while (elem.parentElement) {
      if (elem.parentElement.tagName === 'BERG-LAYOUT') {
        return elem.parentElement;
      }

      elem = elem.parentElement;
    }

    throw new Error('berg-panel can only be used inside berg-layout');
  }

  private showBackdrop(): void {
    this._layoutElement.appendChild(this.getBackdropElement());
  }

  private hideBackdrop(): void {
    const backdrop = this.getBackdropElement();

    if (this._layoutElement.contains(backdrop)) {
      this._layoutElement.removeChild(backdrop);
    }
  }

  private updateBackdrop(): void {
    if (this._absolute && !this._collapsed) {
      this.showBackdrop();
    } else {
      this.hideBackdrop();
    }
  }

  private getBackdropElement(): HTMLElement {
    if (!this._backdropElement) {
      this._backdropElement = this.document.createElement('div');
      this._backdropElement.classList.add('berg-panel-backdrop');

      fromEvent(this._backdropElement, 'click')
        .pipe(takeUntil(this.destroySub))
        .subscribe(() => this.backdropClicked.emit());
    }

    return this._backdropElement;
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
          this.resizePosition === 'above' || this.resizePosition === 'below'
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
