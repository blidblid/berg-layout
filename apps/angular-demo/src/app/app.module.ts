import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BergLayoutModule } from '@berg-layout/angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BergLayoutModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
