import { Directive } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-list-item',
  standalone: false,
  host: {
    class: 'app-list-item',
  },
})
export class ListItemDirective {}
