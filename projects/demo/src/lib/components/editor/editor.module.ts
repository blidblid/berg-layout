import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BergOutletModule } from '@berglund/mixins';
import { BergHighlightCodeModule } from '../code-highlighter';
import { EditorNavComponent } from './editor-nav.component';
import { EditorComponent } from './editor.component';

const API = [EditorComponent, EditorNavComponent];

@NgModule({
  declarations: API,
  exports: API,
  imports: [
    BergHighlightCodeModule,
    BergOutletModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
  ],
})
export class EditorModule {}
