import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { BergOutletModule } from '@berglund/mixins';
import { BergHighlightCodeModule } from '../code-highlighter';
import { EditorComponent } from './editor.component';

@NgModule({
  declarations: [EditorComponent],
  exports: [EditorComponent],
  imports: [
    BergHighlightCodeModule,
    BergOutletModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
  ],
})
export class EditorModule {}
