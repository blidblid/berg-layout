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
export class AngularCodePrinter extends CodePrinter {
  importCommand = `npm i @berg-layout/core @berg-layout/angular`;
  importDeclaration = `import { BergLayoutModule } from '@berg-layout/angular';`;
  layoutTagName = 'berg-layout';
  panelTagName = 'berg-panel';

  printCss(theme: string): string {
    return `@import '@berg-layout/core/prebuilt/${theme}.css';`;
  }

  printScss(theme: string): string {
    return [
      `@use '@berg-layout/core' as layout;`,
      '',
      ':root {',
      `  @include layout.${theme}();`,
      '}',
    ].join('\n');
  }

  printHtml(
    layout: Partial<BergLayoutInputs>,
    panels: Partial<Record<BergPanelSlot, Partial<BergLayoutInputs>>>,
    slots: BergPanelSlot[]
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

    const panelElements = slots
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
      '\n\n' +
      '  <div slot="content">Hello world</div>' +
      '\n' +
      this.endHtmlElement(this.layoutTagName);

    return html;
  }

  printInputs(inputs: object): string[] {
    return Object.entries(inputs).map(([key, value]) => {
      return `[${key}]="${this.toSingleQuoteJsonString(value)}"`;
    });
  }

  startHtmlElement(tagName: string): string {
    return `<${tagName}`;
  }

  endHtmlElement(tagName: string): string {
    return `</${tagName}>`;
  }
}
