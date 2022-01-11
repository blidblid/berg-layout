import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BergOutletModule } from '@berglund/mixins';
import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [EditorComponent],
  exports: [EditorComponent],
  imports: [
    BergOutletModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
})
export class EditorModule {}
