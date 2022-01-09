import { Directive } from '@angular/core';

@Directive({
  selector: 'app-card-title',
  host: {
    class: 'app-card-title h3',
  },
})
export class CardTitle {}
