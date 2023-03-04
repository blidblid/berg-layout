import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BergHighlightCodeModule } from '../code-highlighter';
import { MaterialSharedModule } from '../material-shared.module';
import { EditorCodeComponent } from './editor-code.component';
import { EditorFormComponent } from './editor-form.component';
import { EditorIconNavComponent } from './editor-icon-nav.component';
import { EditorNavComponent } from './editor-nav.component';

const API = [
  EditorCodeComponent,
  EditorFormComponent,
  EditorNavComponent,
  EditorIconNavComponent,
];

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
