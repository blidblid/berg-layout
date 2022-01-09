import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { CardTitle } from './card-title';
import { CardComponent } from './card.component';

const API = [CardTitle, CardComponent];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule, IconModule],
})
export class CardModule {}
