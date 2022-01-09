import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule, IconModule, ListModule } from '@demo/components';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  exports: [HomeComponent],
  imports: [CardModule, CommonModule, IconModule, ListModule, RouterModule],
})
export class HomeModule {}
