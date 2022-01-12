import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergLayoutModule } from '@berg-layout/angular';
import { EditorModule } from '@demo/components';
import { AngularDemoComponent } from './angular-demo.component';

@NgModule({
  declarations: [AngularDemoComponent],
  exports: [AngularDemoComponent],
  imports: [BergLayoutModule, CommonModule, EditorModule],
})
export class AngularDemoModule {}