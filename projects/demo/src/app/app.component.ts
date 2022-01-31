import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { LayoutRx } from '@demo/rx';
import { map, pairwise, startWith } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private layoutRx: LayoutRx
  ) {
    this.layoutRx.layoutStyle$
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
