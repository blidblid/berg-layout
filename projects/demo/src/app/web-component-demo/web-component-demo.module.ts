import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EditorModule, ToolbarModule } from '@demo/components';
import { WebComponentDemoComponent } from './web-component-demo.component';

@NgModule({
  declarations: [WebComponentDemoComponent],
  exports: [WebComponentDemoComponent],
  imports: [
    CommonModule,
    EditorModule,
    MatButtonModule,
    MatIconModule,
    ToolbarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WebComponentDemoModule {}
