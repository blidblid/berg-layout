import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'berg-layout-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AppComponent {
  title = 'angular-demo';
}
