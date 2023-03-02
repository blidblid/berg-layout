import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { IconModule } from '../icon';
import { MaterialSharedModule } from '../material-shared.module';
import { ToolbarComponent } from './toolbar.component';

@NgModule({
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent],
  imports: [CommonModule, MaterialSharedModule, IconModule, RouterModule],
})
export class ToolbarModule {
  constructor(
    private domSanitizer: DomSanitizer,
    private iconRegistry: MatIconRegistry
  ) {
    for (const iconName of ['github', 'npm'])
      this.iconRegistry.addSvgIcon(
        iconName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(
          `assets/${iconName}.svg`
        )
      );
  }
}
