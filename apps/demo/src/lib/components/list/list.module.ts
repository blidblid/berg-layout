import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListItem } from './list-item';
import { ListTitle } from './list-title';
import { ListComponent } from './list.component';

const API = [ListComponent, ListItem, ListTitle];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule],
})
export class ListModule {}
