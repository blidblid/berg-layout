import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { WebComponentDemoComponent } from './web-component-demo.component';

@NgModule({
  declarations: [WebComponentDemoComponent],
  exports: [WebComponentDemoComponent],
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WebComponentDemoModule {}
