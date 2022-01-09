import { Directive } from '@angular/core';

@Directive({
  selector: 'app-list-item',
  host: {
    class: 'app-list-item',
  },
})
export class ListItem {}
