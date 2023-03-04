import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconModule } from '../icon';
import { MaterialSharedModule } from '../material-shared.module';
import { ToolbarComponent } from './toolbar.component';

@NgModule({
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent],
  imports: [CommonModule, MaterialSharedModule, IconModule, RouterModule],
})
export class ToolbarModule {}
