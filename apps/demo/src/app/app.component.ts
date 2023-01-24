import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { map, pairwise, startWith } from 'rxjs';
import { LayoutRx } from '../lib/rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private layoutRx: LayoutRx
  ) {
    this.layoutRx.layout.theme
      .pipe(
        map(
          (style) => `app-root-${style.toLocaleLowerCase().replace(/\s/, '-')}`
        ),
        startWith(null),
        pairwise()
      )
      .subscribe(([previous, curr]) => {
        if (previous) {
          this.document.body.classList.remove(previous);
        }

        if (curr) {
          this.document.body.classList.add(curr);
        }
      });
  }
}
