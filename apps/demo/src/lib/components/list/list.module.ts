import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListItem } from './list-item';
import { ListComponent } from './list.component';

const API = [ListComponent, ListItem];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule],
})
export class ListModule {}
