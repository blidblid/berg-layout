import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergPanelModule } from '../panel';
import { LayoutComponent } from './layout.component';

const API = [LayoutComponent];

@NgModule({
  declarations: API,
  exports: API,
  imports: [BergPanelModule, CommonModule],
})
export class BergLayoutModule {}
