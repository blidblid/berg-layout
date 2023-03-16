import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AppCardModule,
  IconModule,
  IllustrationModule,
  ListModule,
} from '../../lib/components';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  exports: [HomeComponent],
  imports: [
    AppCardModule,
    CommonModule,
    IconModule,
    IllustrationModule,
    ListModule,
    RouterModule,
  ],
})
export class HomeModule {}
