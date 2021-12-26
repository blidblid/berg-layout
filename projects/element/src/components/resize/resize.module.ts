import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergResizeDirective } from './resize.directive';

@NgModule({
  declarations: [BergResizeDirective],
  exports: [BergResizeDirective],
  imports: [CommonModule],
})
export class ResizeModule {}
