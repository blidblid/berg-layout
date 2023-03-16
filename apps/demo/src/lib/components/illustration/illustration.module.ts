import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialSharedModule } from '../material-shared.module';
import { IllustrationComponent } from './illustration.component';

@NgModule({
  declarations: [IllustrationComponent],
  exports: [IllustrationComponent],
  imports: [CommonModule, MaterialSharedModule],
})
export class IllustrationModule {}
