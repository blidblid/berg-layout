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
export class ReactCodePrinter extends CodePrinter {
  importCommand = `npm i @berg-layout/core @berg-layout/react`;
  importDeclaration = `import { BergLayout, BergPanel } from '@berg-layout/react';`;
  layoutTagName = 'BergLayout';
  panelTagName = 'BergPanel';

  printCss(theme: string): string {
    return [
      `@import '@berg-layout/core/prebuilt/core.css';`,
      `@import '@berg-layout/core/prebuilt/${theme}.css';`,
    ].join('\n');
  }

  printScss(theme: string): string {
    return [
      `@use '@berg-layout/core' as layout;`,
      '',
      '@include layout.core();',
      '',
      ':root {',
      `  @include layout.${theme}();`,
      '}',
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
        '\n';
    }

    const panelElements = (['top', 'right', 'bottom', 'left'] as const)
      .map((slot) => panels[slot])
      .filter((panel): panel is BergPanelInputs => !!panel)
      .map((panel) => {
        const changedPanelInputs = this.findChangedInputs(
          panel,
          BERG_PANEL_DEFAULT_INPUTS
        );

        return (
          this.indent(this.startHtmlElement(this.panelTagName), 4) +
          '\n' +
          this.printInputs(changedPanelInputs)
            .map((input) => this.indent(input, 6))
            .join('\n') +
          '\n' +
          this.indent('/>', 4)
        );
      });

    html += `\n  children={[\n${panelElements.join(',\n')}\n  ]}` + '\n/>';

    return html;
  }

  printInputs(inputs: object): string[] {
    return Object.entries(inputs).map(([key, value]) => {
      return `${key}={${this.toSingleQuoteJsonString(value)}}`;
    });
  }

  startHtmlElement(tagName: string): string {
    return `<${tagName}`;
  }
}
