/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BergLayoutAttribute,
  BergLayoutAttributes,
  BergLayoutElement,
  BergPanelAttribute,
  BergPanelAttributes,
  BergPanelSlot,
  BERG_LAYOUT_DEFAULTS,
  BERG_LAYOUT_TAG_NAME,
  BERG_PANEL_DEFAULTS,
} from '@berg-layout/core';
import { BergLayoutTestHarness, runLayoutTests } from '@berg-layout/testing';
import { BergLayoutModule } from '../layout/layout.module';

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutTestComponent],
      imports: [BergLayoutModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutTestComponent);
    fixture.detectChanges();
  });

  function getLayout(): BergLayoutElement {
    return fixture.debugElement.nativeElement.querySelector(
      BERG_LAYOUT_TAG_NAME
    );
  }

  async function setPanelAttribute<T extends BergPanelAttribute>(
    slot: BergPanelSlot,
    input: T,
    value: BergPanelAttributes[T]
  ): Promise<unknown> {
    fixture.componentInstance[slot][input] = value;
    fixture.detectChanges();
    return Promise.all([fixture.whenStable(), fixture.whenRenderingDone()]);
  }

  async function setLayoutAttribute<T extends BergLayoutAttribute>(
    input: T,
    value: BergLayoutAttributes[T]
  ): Promise<unknown> {
    fixture.componentInstance.layout[input] = value;
    fixture.detectChanges();
    return Promise.all([fixture.whenStable(), fixture.whenRenderingDone()]);
  }

  const harness = new BergLayoutTestHarness(getLayout);
  runLayoutTests(harness, setLayoutAttribute, setPanelAttribute);

  describe('output re-emission', () => {
    it('should emit backdropClicked when backdrop is clicked', async () => {
      await setPanelAttribute('top', 'absolute', true);
      await harness.clickBackdrop('top');

      expect(
        fixture.componentInstance.backdropEvent instanceof MouseEvent
      ).toBe(true);
    });
  });
});

@Component({
  template: `
    <berg-layout
      #layoutRef
      [resizeDisabled]="layout['resize-disabled']"
      [resizeTwoDimensions]="layout['resize-two-dimensions']"
      [resizePreviewDelay]="layout['resize-preview-delay']"
      [topLeftPosition]="layout['top-left-position']"
      [topRightPosition]="layout['top-right-position']"
      [bottomRightPosition]="layout['bottom-right-position']"
      [bottomLeftPosition]="layout['bottom-left-position']"
      [topInset]="layout['top-inset']"
      [rightInset]="layout['right-inset']"
      [bottomInset]="layout['bottom-inset']"
      [leftInset]="layout['left-inset']"
    >
      <berg-panel
        #topRef
        slot="top"
        *ngIf="showTop"
        [size]="top.size"
        [minSize]="top['min-size']"
        [maxSize]="top['max-size']"
        [eventBindingMode]="top['event-binding-mode']"
        [absolute]="top.absolute"
        [collapsed]="top.collapsed"
        [resizeDisabled]="top['resize-disabled']"
        (backdropClicked)="onBackdropClicked($event)"
      >
      </berg-panel>

      <berg-panel
        #rightRef
        slot="right"
        *ngIf="showRight"
        [size]="right.size"
        [minSize]="right['min-size']"
        [maxSize]="right['max-size']"
        [eventBindingMode]="right['event-binding-mode']"
        [absolute]="right.absolute"
        [collapsed]="right.collapsed"
        [resizeDisabled]="right['resize-disabled']"
      >
      </berg-panel>

      <berg-panel
        #bottomRef
        slot="bottom"
        *ngIf="showBottom"
        [size]="bottom.size"
        [minSize]="bottom['min-size']"
        [maxSize]="bottom['max-size']"
        [eventBindingMode]="bottom['event-binding-mode']"
        [absolute]="bottom.absolute"
        [collapsed]="bottom.collapsed"
        [resizeDisabled]="bottom['resize-disabled']"
      >
      </berg-panel>

      <berg-panel
        #leftRef
        slot="left"
        *ngIf="showLeft"
        [size]="left.size"
        [minSize]="left['min-size']"
        [maxSize]="left['max-size']"
        [eventBindingMode]="left['event-binding-mode']"
        [absolute]="left.absolute"
        [collapsed]="left.collapsed"
        [resizeDisabled]="left['resize-disabled']"
      >
      </berg-panel>

      <berg-panel #centerRef slot="center"></berg-panel>
    </berg-layout>
  `,
})
export class LayoutTestComponent {
  layout = { ...BERG_LAYOUT_DEFAULTS };

  center = { ...BERG_PANEL_DEFAULTS };
  top = { ...BERG_PANEL_DEFAULTS };
  right = { ...BERG_PANEL_DEFAULTS };
  bottom = { ...BERG_PANEL_DEFAULTS };
  left = { ...BERG_PANEL_DEFAULTS };

  showTop = true;
  showRight = true;
  showBottom = true;
  showLeft = true;

  backdropEvent: MouseEvent | undefined;

  onBackdropClicked(event: MouseEvent): void {
    this.backdropEvent = event;
  }
}
