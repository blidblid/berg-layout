import { Directive } from '@angular/core';

@Directive({
  selector: 'app-list-title',
  host: {
    class: 'app-list-title h2',
  },
})
export class ListTitle {}
