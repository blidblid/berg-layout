import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LayoutRx } from '../../rx';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  host: {
    class: 'app-toolbar',
  },
})
export class ToolbarComponent {
  private layoutRx = inject(LayoutRx);
  private router = inject(Router);

  feature$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => this.router.url.split('/')[1])
  );

  npmLink$ = this.feature$.pipe(
    map((feature) => `https://www.npmjs.com/package/@berg-layout/${feature}`)
  );

  toggleRight(): void {
    this.layoutRx.right.collapsed.next(!this.layoutRx.right.collapsed.value);
  }
}
