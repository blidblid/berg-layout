import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergResizeDirective } from './resize.directive';

const API = [BergResizeDirective];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule, OverlayModule],
})
export class BergResizeModule {}
