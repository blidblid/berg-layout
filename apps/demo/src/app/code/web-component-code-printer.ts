import { Injectable } from '@angular/core';
import {
  BergLayoutInputs,
  BergPanelInputs,
  BergPanelSlot,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/core';
import { CodePrinter } from './code-printer';

@Injectable()
export class WebComponentCodePrinter extends CodePrinter {
  importDeclaration = `import '@berg-layout/core';`;
  layoutTagName = 'berg-layout-web-component';
  panelTagName = 'berg-panel-web-component';

  printCss(theme: string): string {
    return [
      `@import '~@berg-layout/core/prebuilt/core.css';`,
      `@import '~@berg-layout/core/prebuilt/${theme}.css';`,
    ].join('\n');
  }

  printScss(theme: string): string {
    return [
      `@use '~@berg-layout/core' as layout;`,
      '@include layout.core();',
      `@include layout.${theme}();`,
    ].join('\n');
  }

  printHtml(
    layout: Partial<BergLayoutInputs>,
    panels: Partial<Record<BergPanelSlot, Partial<BergLayoutInputs>>>
  ): string {
    let html = this.startHtmlElement(this.layoutTagName);

    const changedLayoutInputs = this.findChangedInputs(
      layout,
      BERG_LAYOUT_DEFAULT_INPUTS
    );

    if (Object.keys(changedLayoutInputs).length > 0) {
      html +=
        '\n' +
        this.printInputs(changedLayoutInputs)
          .map((input) => this.indent(input, 2))
          .join('\n') +
        '\n>';
    } else {
      html += '>';
    }

    html += '\n';

    const panelElements = (['top', 'right', 'bottom', 'left'] as const)
      .map((slot) => panels[slot])
      .filter((panel): panel is BergPanelInputs => !!panel)
      .map((panel) => {
        const changedPanelInputs = this.findChangedInputs(
          panel,
          BERG_PANEL_DEFAULT_INPUTS
        );

        return (
          this.indent(this.startHtmlElement(this.panelTagName), 2) +
          '\n' +
          this.printInputs(changedPanelInputs)
            .map((input) => this.indent(input, 4))
            .join('\n') +
          '\n' +
          this.indent('>' + this.endHtmlElement(this.panelTagName), 2)
        );
      });

    html +=
      panelElements.join('\n\n') +
      '\n' +
      this.endHtmlElement(this.layoutTagName);

    return html;
  }

  printInputs(inputs: object): string[] {
    return Object.entries(inputs).map(([key, value]) => {
      return `${this.camelCaseToKebabCase(key)}="${value}"`;
    });
  }

  startHtmlElement(tagName: string): string {
    return `<${tagName}`;
  }

  endHtmlElement(tagName: string): string {
    return `</${tagName}>`;
  }

  private camelCaseToKebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }
}
