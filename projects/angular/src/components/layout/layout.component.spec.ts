import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  BergPanelSlot,
  BergPanelSnap,
  BERG_PANEL_DEFAULT_INPUTS,
} from '../panel/panel-model';
import { BergPanelComponent } from '../panel/panel.component';
import { BERG_LAYOUT_DEFAULT_INPUTS } from './layout-model';
import { BergLayoutModule } from './layout.module';

describe('LayoutComponent', () => {
  let c: LayoutTestComponent;
  let fixture: ComponentFixture<LayoutTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutTestComponent],
      imports: [BergLayoutModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutTestComponent);
    c = fixture.componentInstance;
  });

  describe('alignment', () => {
    beforeEach(() => fixture.detectChanges());

    it('should render top panel next to left, center and right', () => {
      expect(c.topRect.bottom).toBe(c.leftRect.top);
      expect(c.topRect.bottom).toBe(c.centerRect.top);
      expect(c.topRect.bottom).toBe(c.rightRect.top);
    });

    it('should render right panel next to top, bottom and center', () => {
      expect(c.rightRect.top).toBe(c.topRect.bottom);
      expect(c.rightRect.bottom).toBe(c.bottomRect.top);
      expect(c.rightRect.left).toBe(c.centerRect.right);
    });

    it('should render bottom panel next to left, center and right', () => {
      expect(c.bottomRect.top).toBe(c.leftRect.bottom);
      expect(c.bottomRect.top).toBe(c.centerRect.bottom);
      expect(c.bottomRect.top).toBe(c.rightRect.bottom);
    });

    it('should render left panel next to center, top and bottom', () => {
      expect(c.leftRect.right).toBe(c.centerRect.left);
      expect(c.leftRect.top).toBe(c.topRect.bottom);
      expect(c.leftRect.bottom).toBe(c.bottomRect.top);
    });

    it('should render center next to all other panels', () => {
      expect(c.centerRect.top).toBe(c.topRect.bottom);
      expect(c.centerRect.right).toBe(c.rightRect.left);
      expect(c.centerRect.bottom).toBe(c.bottomRect.top);
      expect(c.centerRect.left).toBe(c.leftRect.right);
    });
  });

  describe('with absolute an panel', () => {
    it('should create a backdrop that covers the layout', () => {
      c.top.absolute = true;
      fixture.detectChanges();
      expect(c.layoutRect).toEqual(getBackdrop().getBoundingClientRect());
    });

    it('should position top over center, left and right', () => {
      c.top.absolute = true;
      fixture.detectChanges();
      expect(c.topRect.top).toBe(c.centerRect.top);
      expect(c.topRect.left).toBe(c.leftRect.left);
      expect(c.topRect.right).toBe(c.rightRect.right);
    });

    it('should position right over center, top and bottom', () => {
      c.right.absolute = true;
      fixture.detectChanges();
      expect(c.rightRect.right).toBe(c.centerRect.right);
      expect(c.rightRect.top).toBe(c.topRect.top);
      expect(c.rightRect.bottom).toBe(c.bottomRect.bottom);
    });

    it('should position bottom over center, left and right', () => {
      c.bottom.absolute = true;
      fixture.detectChanges();
      expect(c.bottomRect.bottom).toBe(c.centerRect.bottom);
      expect(c.bottomRect.left).toBe(c.leftRect.left);
      expect(c.bottomRect.right).toBe(c.rightRect.right);
    });

    it('should position left over center, top and bottom', () => {
      c.left.absolute = true;
      fixture.detectChanges();
      expect(c.leftRect.left).toBe(c.centerRect.left);
      expect(c.leftRect.top).toBe(c.topRect.top);
      expect(c.leftRect.bottom).toBe(c.bottomRect.bottom);
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

    it('should start collapsing when collapsing programmatically', () => {
      fixture.detectChanges();
      c.leftPanel.collapse();
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(true);
    });

    it('should start expanding when setting the collapsed attribute to false', fakeAsync(() => {
      c.left.collapsed = true;
      fixture.detectChanges();
      c.left.collapsed = false;
      fixture.detectChanges();
      tick(REQUEST_ANIMATION_FRAME_TICK);
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    }));

    it('should start expanding when expanding programmatically', fakeAsync(() => {
      c.left.collapsed = true;
      fixture.detectChanges();
      c.leftPanel.expand();
      fixture.detectChanges();
      tick(REQUEST_ANIMATION_FRAME_TICK);
      fixture.detectChanges();
      expect(checkIfPanelIsCollapsed('left')).toBe(false);
    }));
  });

  const REQUEST_ANIMATION_FRAME_TICK = 16;

  function checkIfPanelIsCollapsed(slot: BergPanelSlot): boolean {
    return (
      fixture.nativeElement.querySelector(`.berg-panel-${slot}`).style
        .margin !== ''
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
      [resizeExpandOffset]="layout.resizeExpandOffset"
      [resizeCollapseOffset]="layout.resizeCollapseOffset"
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
        [snap]="top.snap"
        (snapped)="onSnapped('top', $event)"
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
        [snap]="right.snap"
        (snapped)="onSnapped('right', $event)"
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
        [snap]="bottom.snap"
        (snapped)="onSnapped('bottom', $event)"
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
        [snap]="left.snap"
        (snapped)="onSnapped('left', $event)"
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

  @ViewChild('leftRef') leftPanel: BergPanelComponent;

  showTop = true;
  showRight = true;
  showBottom = true;
  showLeft = true;

  top = { ...BERG_PANEL_DEFAULT_INPUTS };
  right = { ...BERG_PANEL_DEFAULT_INPUTS };
  bottom = { ...BERG_PANEL_DEFAULT_INPUTS };
  left = { ...BERG_PANEL_DEFAULT_INPUTS };

  layout = { ...BERG_LAYOUT_DEFAULT_INPUTS };

  snap: Partial<Record<BergPanelSlot, BergPanelSnap>> = {};
  backdropClick: Partial<Record<BergPanelSlot, true>> = {};

  onSnapped(slot: BergPanelSlot, snap: BergPanelSnap) {
    this.snap[slot] = snap;
  }

  onBackdropClicked(slot: BergPanelSlot) {
    this.backdropClick[slot] = true;
  }
}
