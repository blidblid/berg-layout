import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergLayoutModule } from '@berg-layout/angular';
import { AngularDemoComponent } from './angular-demo.component';
import {
  EditorModule,
  MaterialSharedModule,
  ToolbarModule,
} from '../../lib/components';

@NgModule({
  declarations: [AngularDemoComponent],
  exports: [AngularDemoComponent],
  imports: [
    BergLayoutModule,
    CommonModule,
    MaterialSharedModule,
    EditorModule,
    ToolbarModule,
  ],
})
export class AngularDemoModule {}
