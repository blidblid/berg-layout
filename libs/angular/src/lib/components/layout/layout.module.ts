import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import '@berg-layout/core';
import { BergPanelComponent } from '../panel';
import { BergLayoutComponent } from './layout.component';

const API = [BergLayoutComponent, BergPanelComponent];

@NgModule({
  declarations: API,
  exports: [...API],
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BergLayoutModule {}
