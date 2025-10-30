import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { map, pairwise, startWith } from 'rxjs';
import { LayoutRx } from '../lib/rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AppComponent {
  private document = inject(DOCUMENT);
  private layoutRx = inject(LayoutRx);

  constructor() {
    this.layoutRx.theme
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
