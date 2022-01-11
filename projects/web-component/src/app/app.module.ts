import {
  CUSTOM_ELEMENTS_SCHEMA,
  DoBootstrap,
  Injector,
  NgModule,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';
import { BergLayoutComponent, BergPanelComponent } from '@berg-layout/angular';

@NgModule({
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule implements DoBootstrap {
  constructor(injector: Injector) {
    for (const [component, name] of [
      [BergLayoutComponent, 'berg-layout'] as const,
      [BergPanelComponent, 'berg-panel'] as const,
    ]) {
      if (customElements.get(name) === undefined) {
        customElements.define(
          name,
          createCustomElement(component, {
            injector,
          })
        );
      }
    }
  }

  ngDoBootstrap(): void {}
}
