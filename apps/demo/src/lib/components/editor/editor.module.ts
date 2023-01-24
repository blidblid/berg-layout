import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BergHighlightCodeModule } from '../code-highlighter';
import { EditorIconNavComponent } from './editor-icon-nav.component';
import { EditorNavComponent } from './editor-nav.component';
import { EditorComponent } from './editor.component';
import { MaterialSharedModule } from '../material-shared.module';
import { ReactiveFormsModule } from '@angular/forms';

const API = [EditorComponent, EditorNavComponent, EditorIconNavComponent];

@NgModule({
  declarations: API,
  exports: API,
  imports: [
    BergHighlightCodeModule,
    CommonModule,
    MaterialSharedModule,
    ReactiveFormsModule,
  ],
})
export class EditorModule {}
