import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconModule } from '../icon/icon.module';
import { CardTitleDirective } from './card-title';
import { CardComponent } from './card.component';

const API = [CardTitleDirective, CardComponent];

@NgModule({
  declarations: API,
  exports: API,
  imports: [CommonModule, IconModule],
})
export class AppCardModule {}
