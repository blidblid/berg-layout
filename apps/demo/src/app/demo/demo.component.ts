import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { BergPanelResizeEvent, BergPanelSlot } from '@berg-layout/core';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';
import { Breakpoints, EditorView } from '../../lib/components';
import { LayoutRx } from '../../lib/rx';
import { CodePrinter } from '../code';

@Component({
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-demo',
  },
})
export class DemoComponent implements OnDestroy {
  view: EditorView = 'code';

  topSize = 80;
  bottomSize = 49;
  rightSize = 350;

  html$ = combineLatest([
    this.rx.layout$,
    this.rx.top$,
    this.rx.right$,
    this.rx.bottom$,
    this.rx.left$,
    this.rx.remove$,
  ]).pipe(
    map(([layout, top, right, bottom, left, remove]) => {
      return this.codePrinter.printHtml(
        layout,
        { top, right, bottom, left },
        (['top', 'right', 'bottom', 'left'] as const).filter(
          (slot) => !remove[slot]
        )
      );
    })
  );

  css$ = this.rx.theme.pipe(
    map((theme) => {
      return this.codePrinter.printCss(
        theme.replace(/\s/g, '-').toLocaleLowerCase()
      );
    })
  );

  scss$ = this.rx.theme.pipe(
    map((theme) => {
      return this.codePrinter.printScss(
        theme.replace(/\s/g, '-').toLocaleLowerCase()
      );
    })
  );

  private collapsePanelAtSize = 25;
  private initialLeftSize = 55;
  private expandedLeftSize = 160;

  leftSize = this.initialLeftSize;

  private destroySub = new Subject<void>();

  constructor(
    protected codePrinter: CodePrinter,
    protected rx: LayoutRx,
    protected breakpoints: Breakpoints
  ) {
    this.subscribe();
  }

  onResized(slot: BergPanelSlot, event: BergPanelResizeEvent | Event): void {
    const resizeEvent = event instanceof CustomEvent ? event.detail : event;

    if (resizeEvent.size < this.collapsePanelAtSize) {
      this.rx[slot].collapsed.next(true);
    } else if (resizeEvent.size > this.collapsePanelAtSize) {
      this.rx[slot].collapsed.next(false);
    }

    if (slot !== 'left') {
      return;
    }

    if (resizeEvent.size > this.expandedLeftSize) {
      this.leftSize = this.expandedLeftSize;
    } else {
      this.leftSize = this.initialLeftSize;
    }
  }

  onBackdropClicked(slot: BergPanelSlot): void {
    this.rx[slot].collapsed.next(true);
  }

  private subscribe(): void {
    this.breakpoints.breakpoints$
      .pipe(takeUntil(this.destroySub))
      .subscribe((breakpoints) => {
        this.rx.right.absolute.next(breakpoints.small);
        this.rx.right.collapsed.next(breakpoints.small);
      });
  }

  ngOnDestroy(): void {
    this.destroySub.next();
    this.destroySub.complete();
  }
}
