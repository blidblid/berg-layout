import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { BergPanel } from '../panel/panel';
import { BergPanelSlot, BERG_PANEL_DEFAULTS } from '../panel/panel-model';
import { BERG_LAYOUT_DEFAULTS } from './layout-model';

describe('LayoutComponent', () => {
  let c: LayoutTestComponent;
  let fixture: ComponentFixture<LayoutTestComponent>;

  beforeEach(async () => {});

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutTestComponent);
    c = fixture.componentInstance;
  });

  describe('alignment', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render top panel next to left and right', () => {
      expect(c.topRect.bottom).withContext('top and left').toBe(c.leftRect.top);

      expect(c.topRect.bottom)
        .withContext('top and right')
        .toBe(c.rightRect.top);
    });

    it('should render right panel next to top and bottom', () => {
      expect(c.rightRect.top)
        .withContext('right and top')
        .toBe(c.topRect.bottom);

      expect(c.rightRect.bottom)
        .withContext('right and bottom')
        .toBe(c.bottomRect.top);
    });

    it('should render bottom panel next to left and right', () => {
      expect(c.bottomRect.top)
        .withContext('bottom and left')
        .toBe(c.leftRect.bottom);

      expect(c.bottomRect.top)
        .withContext('bottom and right')
        .toBe(c.rightRect.bottom);
    });

    it('should render left panel next to top and bottom', () => {
      expect(c.leftRect.top).withContext('left and top').toBe(c.topRect.bottom);

      expect(c.leftRect.bottom)
        .withContext('left and bottom')
        .toBe(c.bottomRect.top);
    });
  });

  describe('with absolute an panel', () => {
    it('should create a backdrop that covers the layout', () => {
      c.top.absolute = true;
      fixture.detectChanges();
      expect(c.layoutRect).toEqual(getBackdrop().getBoundingClientRect());
    });

    it('should position top over center', () => {
      c.top.absolute = true;
      fixture.detectChanges();
      expect(getComputedStyle(c.centerElem).paddingTop).toBe('0px');
    });

    it('should position right over center', () => {
      c.right.absolute = true;
      fixture.detectChanges();
      expect(getComputedStyle(c.centerElem).paddingRight).toBe('0px');
    });

    it('should position bottom over center', () => {
      c.bottom.absolute = true;
      fixture.detectChanges();
      expect(getComputedStyle(c.centerElem).paddingBottom).toBe('0px');
    });

    it('should position left over center', () => {
      c.left.absolute = true;
      fixture.detectChanges();
      expect(getComputedStyle(c.centerElem).paddingLeft).toBe('0px');
    });

    it('should emit backdropClicked event when clicking backdrop.', () => {
      c.left.absolute = true;
      fixture.detectChanges();

      getBackdrop().click();
      fixture.detectChanges();

      expect(c.backdropClick).toEqual({ left: true });
    });

    it('should close the panel when clicking the backdrop in "auto"-binding mode.', () => {
      c.left.absolute = true;
      fixture.detectChanges();

      getBackdrop().click();
      fixture.detectChanges();

      expect(checkIfPanelIsCollapsed('left')).toBe(true);
    });

    it('should not close the panel when clicking the backdrop in "noop"-binding mode.', () => {
      c.left.absolute = true;
      c.left.outputBindingMode = 'noop';
      fixture.detectChanges();

      getBackdrop().click();
      fixture.detectChanges();

      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });
  });

  describe('with a collapsed panel', () => {
    it('should not be collapsed initially', () => {
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    });

    it('should start collapsed when using the collapsed attribute', fakeAsync(() => {
      c.left.collapsed = true;
      fixture.detectChanges();
      tick(REQUEST_ANIMATION_FRAME_TICK);
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(true);
    }));

    it('should start expanding when setting the collapsed attribute to false', fakeAsync(() => {
      c.left.collapsed = true;
      fixture.detectChanges();
      c.left.collapsed = false;
      fixture.detectChanges();
      tick(REQUEST_ANIMATION_FRAME_TICK);
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    }));

    it('should start expanding when setting the collapsed attribute to false', fakeAsync(() => {
      c.left.collapsed = true;
      fixture.detectChanges();
      c.left.collapsed = false;
      fixture.detectChanges();
      tick(REQUEST_ANIMATION_FRAME_TICK);
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    }));
  });

  const REQUEST_ANIMATION_FRAME_TICK = 16;

  function checkIfPanelIsCollapsed(slot: BergPanelSlot): boolean {
    return !!fixture.nativeElement.querySelector(
      `.berg-panel-${slot}.berg-panel-collapsed`
    );
  }

  function getBackdrop(): HTMLElement {
    const backdrop = fixture.nativeElement.querySelector(
      '.berg-panel-backdrop'
    );

    expect(backdrop).withContext('expected a backdrop').toBeTruthy();
    return backdrop;
  }
});

@Component({
  template: `
    <berg-layout
      #layoutRef
      [resizeDisabled]="layout.resizeDisabled"
      [resizeTwoDimensions]="layout.resizeTwoDimensions"
      [resizePreviewDelay]="layout.resizePreviewDelay"
    >
      <berg-panel
        #topRef
        slot="top"
        *ngIf="showTop"
        [outputBindingMode]="top.outputBindingMode"
        [absolute]="top.absolute"
        [collapsed]="top.collapsed"
        [resizeDisabled]="top.resizeDisabled"
        (backdropClicked)="onBackdropClicked('top')"
      >
      </berg-panel>

      <berg-panel
        #rightRef
        slot="right"
        *ngIf="showRight"
        [outputBindingMode]="right.outputBindingMode"
        [absolute]="right.absolute"
        [collapsed]="right.collapsed"
        [resizeDisabled]="right.resizeDisabled"
        (backdropClicked)="onBackdropClicked('right')"
      >
      </berg-panel>

      <berg-panel
        #bottomRef
        slot="bottom"
        *ngIf="showBottom"
        [outputBindingMode]="bottom.outputBindingMode"
        [absolute]="bottom.absolute"
        [collapsed]="bottom.collapsed"
        [resizeDisabled]="bottom.resizeDisabled"
        (backdropClicked)="onBackdropClicked('bottom')"
      >
      </berg-panel>

      <berg-panel
        #leftRef
        slot="left"
        *ngIf="showLeft"
        [outputBindingMode]="left.outputBindingMode"
        [absolute]="left.absolute"
        [collapsed]="left.collapsed"
        [resizeDisabled]="left.resizeDisabled"
        (backdropClicked)="onBackdropClicked('left')"
      >
      </berg-panel>

      <berg-panel #centerRef></berg-panel>
    </berg-layout>
  `,
})
export class LayoutTestComponent {
  @ViewChild('layoutRef', { read: ElementRef })
  private layoutElementRef: ElementRef<HTMLElement>;
  get layoutElem() {
    return this.layoutElementRef.nativeElement;
  }
  get layoutRect() {
    return this.layoutElem.getBoundingClientRect();
  }

  @ViewChild('topRef', { read: ElementRef })
  private topElementRef: ElementRef<HTMLElement>;
  get topElem() {
    return this.topElementRef.nativeElement;
  }
  get topRect() {
    return this.topElem.getBoundingClientRect();
  }

  @ViewChild('rightRef', { read: ElementRef })
  private rightElementRef: ElementRef<HTMLElement>;
  get rightElem() {
    return this.rightElementRef.nativeElement;
  }
  get rightRect() {
    return this.rightElem.getBoundingClientRect();
  }

  @ViewChild('bottomRef', { read: ElementRef })
  private bottomElementRef: ElementRef<HTMLElement>;
  get bottomElem() {
    return this.bottomElementRef.nativeElement;
  }
  get bottomRect() {
    return this.bottomElem.getBoundingClientRect();
  }

  @ViewChild('leftRef', { read: ElementRef })
  private leftElementRef: ElementRef<HTMLElement>;
  get leftElem() {
    return this.leftElementRef.nativeElement;
  }
  get leftRect() {
    return this.leftElem.getBoundingClientRect();
  }

  @ViewChild('centerRef', { read: ElementRef })
  private centerElementRef: ElementRef<HTMLElement>;
  get centerElem() {
    return this.centerElementRef.nativeElement;
  }
  get centerRect() {
    return this.centerElem.getBoundingClientRect();
  }

  @ViewChild('leftRef') leftPanel: BergPanel;

  showTop = true;
  showRight = true;
  showBottom = true;
  showLeft = true;

  top = { ...BERG_PANEL_DEFAULTS };
  right = { ...BERG_PANEL_DEFAULTS };
  bottom = { ...BERG_PANEL_DEFAULTS };
  left = { ...BERG_PANEL_DEFAULTS };

  layout = { ...BERG_LAYOUT_DEFAULTS };

  backdropClick: Partial<Record<BergPanelSlot, true>> = {};

  onBackdropClicked(slot: BergPanelSlot) {
    this.backdropClick[slot] = true;
  }
}
