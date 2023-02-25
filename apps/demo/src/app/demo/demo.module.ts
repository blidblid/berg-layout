import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import '@berg-layout/core';
import {
  EditorModule,
  MaterialSharedModule,
  ToolbarModule,
} from '../../lib/components';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  exports: [DemoComponent],
  imports: [CommonModule, MaterialSharedModule, EditorModule, ToolbarModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DemoModule {}
