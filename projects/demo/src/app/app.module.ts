import { CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BergPanelComponent, LayoutComponent } from 'berg-layout/angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor(injector: Injector) {
    for (const element of [
      [LayoutComponent, 'berg-layout'] as const,
      [BergPanelComponent, 'berg-panel'] as const,
    ]) {
      customElements.define(
        element[1],
        createCustomElement(element[0], {
          injector,
        })
      );
    }
  }
}
