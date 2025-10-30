import { Directive } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-card-title',
  standalone: false,
  host: {
    class: 'app-card-title',
  },
})
export class CardTitleDirective {}
