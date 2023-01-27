import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularDemoModule } from './angular-demo/angular-demo.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { WebComponentDemoModule } from './web-component-demo/web-component-demo.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AngularDemoModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HomeModule,
    HttpClientModule,
    WebComponentDemoModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
