import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListItemDirective } from './list-item';
import { ListComponent } from './list.component';

const API = [ListComponent, ListItemDirective];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule],
})
export class ListModule {}
