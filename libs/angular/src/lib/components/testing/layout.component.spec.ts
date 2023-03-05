/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BergLayoutElement,
  BergLayoutInput,
  BergLayoutInputs,
  BergPanelInput,
  BergPanelInputs,
  BergPanelResizeEvent,
  BergPanelSlot,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_LAYOUT_TAG_NAME,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/core';
import {
  BergLayoutTestHarness,
  Render,
  runLayoutTests,
} from '@berg-layout/testing';
import { BergLayoutModule } from '../layout/layout.module';

describe('Angular implementation', () => {
  let fixture: ComponentFixture<LayoutTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutTestComponent],
      imports: [BergLayoutModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutTestComponent);
    fixture.detectChanges();
  });

  const render: Render = async (inputs) => {
    const { layout, top, right, bottom, left } = inputs;

    if (layout) {
      for (const [attribute, value] of Object.entries(layout)) {
        setLayoutAttribute(attribute as BergLayoutInput, value);
      }
    }

    if (top) {
      for (const [attribute, value] of Object.entries(top)) {
        setPanelAttribute('top', attribute as BergPanelInput, value);
      }
    }

    if (right) {
      for (const [attribute, value] of Object.entries(right)) {
        setPanelAttribute('right', attribute as BergPanelInput, value);
      }
    }

    if (bottom) {
      for (const [attribute, value] of Object.entries(bottom)) {
        setPanelAttribute('bottom', attribute as BergPanelInput, value);
      }
    }

    if (left) {
      for (const [attribute, value] of Object.entries(left)) {
        setPanelAttribute('left', attribute as BergPanelInput, value);
      }
    }

    fixture.detectChanges();
    return Promise.all([fixture.whenStable(), fixture.whenRenderingDone()]);
  };

  const harness = new BergLayoutTestHarness(getLayout);
  runLayoutTests(harness, render);

  describe('output re-emission', () => {
    it('should re-emit afterCollapsed and afterExpanded', async () => {
      const panelAnimationDuration = 400;

      await render({
        top: {
          collapsed: true,
        },
      });

      expect(fixture.componentInstance.hasAfterCollapsedEmitted).toBe(false);

      await new Promise((resolve) =>
        setTimeout(resolve, panelAnimationDuration)
      );

      expect(fixture.componentInstance.hasAfterCollapsedEmitted).toBe(true);

      await render({
        top: {
          collapsed: false,
        },
      });

      expect(fixture.componentInstance.hasAfterExpandedEmitted).toBe(false);

      await new Promise((resolve) =>
        setTimeout(resolve, panelAnimationDuration)
      );

      expect(fixture.componentInstance.hasAfterExpandedEmitted).toBe(true);
    });

    it('should re-emit backdropClicked', async () => {
      await render({
        top: {
          absolute: true,
        },
      });

      await harness.clickBackdrop('top');

      expect(
        fixture.componentInstance.backdropEvent instanceof MouseEvent
      ).toBe(true);
    });

    it('should re-emit resized', async () => {
      await harness.resize('top', 100);

      expect(fixture.componentInstance.resizedEvent.size).toBe(100);

      expect(
        fixture.componentInstance.resizedEvent.event instanceof MouseEvent
      ).toBe(true);
    });
  });

  function setLayoutAttribute<T extends BergLayoutInput>(
    input: T,
    value: BergLayoutInputs[T]
  ): void {
    fixture.componentInstance.layout[input] = value;
  }

  function setPanelAttribute<T extends BergPanelInput>(
    slot: BergPanelSlot,
    input: T,
    value: BergPanelInputs[T]
  ): void {
    fixture.componentInstance[slot][input] = value;
  }

  function getLayout(): BergLayoutElement {
    return fixture.debugElement.nativeElement.querySelector(
      BERG_LAYOUT_TAG_NAME
    );
  }
});

@Component({
  template: `
    <berg-layout
      #layoutRef
      [resizeDisabled]="layout.resizeDisabled"
      [resizeTwoDimensions]="layout.resizeTwoDimensions"
      [resizePreviewDelay]="layout.resizePreviewDelay"
      [topLeftPosition]="layout.topLeftPosition"
      [topRightPosition]="layout.topRightPosition"
      [bottomRightPosition]="layout.bottomRightPosition"
      [bottomLeftPosition]="layout.bottomLeftPosition"
      [topInset]="layout.topInset"
      [rightInset]="layout.rightInset"
      [bottomInset]="layout.bottomInset"
      [leftInset]="layout.leftInset"
    >
      <berg-panel
        #topRef
        slot="top"
        *ngIf="showTop"
        [size]="top.size"
        [minSize]="top.minSize"
        [maxSize]="top.maxSize"
        [eventBindingMode]="top.eventBindingMode"
        [absolute]="top.absolute"
        [collapsed]="top.collapsed"
        [resizeDisabled]="top.resizeDisabled"
        (backdropClicked)="onBackdropClicked($event)"
        (resized)="onResized($event)"
        (afterCollapsed)="hasAfterCollapsedEmitted = true"
        (afterExpanded)="hasAfterExpandedEmitted = true"
      >
      </berg-panel>

      <berg-panel
        #rightRef
        slot="right"
        *ngIf="showRight"
        [size]="right.size"
        [minSize]="right.minSize"
        [maxSize]="right.maxSize"
        [eventBindingMode]="right.eventBindingMode"
        [absolute]="right.absolute"
        [collapsed]="right.collapsed"
        [resizeDisabled]="right.resizeDisabled"
      >
      </berg-panel>

      <berg-panel
        #bottomRef
        slot="bottom"
        *ngIf="showBottom"
        [size]="bottom.size"
        [minSize]="bottom.minSize"
        [maxSize]="bottom.maxSize"
        [eventBindingMode]="bottom.eventBindingMode"
        [absolute]="bottom.absolute"
        [collapsed]="bottom.collapsed"
        [resizeDisabled]="bottom.resizeDisabled"
      >
      </berg-panel>

      <berg-panel
        #leftRef
        slot="left"
        *ngIf="showLeft"
        [size]="left.size"
        [minSize]="left.minSize"
        [maxSize]="left.maxSize"
        [eventBindingMode]="left.eventBindingMode"
        [absolute]="left.absolute"
        [collapsed]="left.collapsed"
        [resizeDisabled]="left.resizeDisabled"
      >
      </berg-panel>

      <berg-panel #centerRef slot="content"></berg-panel>
    </berg-layout>
  `,
})
export class LayoutTestComponent {
  layout = { ...BERG_LAYOUT_DEFAULT_INPUTS };

  center = { ...BERG_PANEL_DEFAULT_INPUTS };
  top = { ...BERG_PANEL_DEFAULT_INPUTS };
  right = { ...BERG_PANEL_DEFAULT_INPUTS };
  bottom = { ...BERG_PANEL_DEFAULT_INPUTS };
  left = { ...BERG_PANEL_DEFAULT_INPUTS };

  showTop = true;
  showRight = true;
  showBottom = true;
  showLeft = true;

  hasAfterCollapsedEmitted = false;
  hasAfterExpandedEmitted = false;

  backdropEvent: MouseEvent | undefined;
  resizedEvent: BergPanelResizeEvent;

  onBackdropClicked(event: MouseEvent): void {
    this.backdropEvent = event;
  }

  onResized(event: BergPanelResizeEvent): void {
    this.resizedEvent = event;
  }
}
