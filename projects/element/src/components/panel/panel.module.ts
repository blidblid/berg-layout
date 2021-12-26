import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergPanelComponent } from './panel.component';

@NgModule({
  declarations: [BergPanelComponent],
  exports: [BergPanelComponent],
  imports: [CommonModule],
})
export class BergPanelModule {}
