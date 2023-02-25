import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from './toolbar.component';
import { MaterialSharedModule } from '../material-shared.module';

@NgModule({
  declarations: [ToolbarComponent],
  exports: [ToolbarComponent],
  imports: [CommonModule, MaterialSharedModule, RouterModule],
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
