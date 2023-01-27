import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-home',
  },
})
export class HomeComponent {
  demos = [
    {
      name: 'Angular',
      routerLink: '/angular',
      iconUrl: 'assets/angular.png',
    },
    {
      name: 'Web component',
      routerLink: '/web-component',
      iconUrl: 'assets/web-component.png',
    },
  ];
}
