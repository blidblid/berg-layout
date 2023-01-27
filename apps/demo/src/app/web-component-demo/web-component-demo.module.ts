import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {
  EditorModule,
  MaterialSharedModule,
  ToolbarModule,
} from '../../lib/components';
import { WebComponentDemoComponent } from './web-component-demo.component';

@NgModule({
  declarations: [WebComponentDemoComponent],
  exports: [WebComponentDemoComponent],
  imports: [CommonModule, MaterialSharedModule, EditorModule, ToolbarModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WebComponentDemoModule {}
