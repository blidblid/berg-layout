import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergPanelComponent } from '../panel';
import { BergLayoutComponent } from './layout.component';

const API = [BergLayoutComponent, BergPanelComponent];

@NgModule({
  declarations: API,
  exports: [...API],
  imports: [CommonModule],
})
export class BergLayoutModule {}
