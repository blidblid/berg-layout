import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergHighlightCodeComponent } from './highlightjs.component';

@NgModule({
  declarations: [BergHighlightCodeComponent],
  exports: [BergHighlightCodeComponent],
  imports: [CommonModule],
})
export class BergHighlightCodeModule {}
