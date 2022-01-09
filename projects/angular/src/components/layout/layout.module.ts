import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergPanelModule } from '../panel';
import { BergLayoutComponent } from './layout.component';

const API = [BergLayoutComponent];

@NgModule({
  declarations: API,
  exports: [...API, BergPanelModule],
  imports: [BergPanelModule, CommonModule],
})
export class BergLayoutModule {}
