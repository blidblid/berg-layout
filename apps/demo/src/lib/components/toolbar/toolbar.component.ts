import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-toolbar',
  },
})
export class ToolbarComponent {
  feature$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.router.url.split('/')[1])
  );

  npmLink$ = this.feature$.pipe(
    map((feature) => `https://www.npmjs.com/package/@berg-layout/${feature}`)
  );

  constructor(private router: Router) {
    this.feature$.subscribe(console.log);
  }
}
