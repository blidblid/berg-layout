import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BergLayoutModule } from '@berg-layout/angular';
import { EditorModule } from '@demo/components';
import { AngularDemoComponent } from './angular-demo.component';

@NgModule({
  declarations: [AngularDemoComponent],
  exports: [AngularDemoComponent],
  imports: [
    BergLayoutModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    EditorModule,
  ],
})
export class AngularDemoModule {}
