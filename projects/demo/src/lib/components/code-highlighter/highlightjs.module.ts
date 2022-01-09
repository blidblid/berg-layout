import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergHighlightCodeDirective } from './highlightjs.directive';

@NgModule({
  declarations: [BergHighlightCodeDirective],
  exports: [BergHighlightCodeDirective],
  imports: [CommonModule],
})
export class BergHighlightCodeModule {}
