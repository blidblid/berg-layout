import {
  BergLayoutInputs,
  BergPanelInputs,
  BergPanelSlot,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/core';
import { CodePrinter } from './code-printer';

export class AngularCodePrinter extends CodePrinter {
  importDeclaration = `import { BergLayoutModule } from '@berg-layout/angular';`;
  layoutTagName = 'berg-layout';
  panelTagName = 'berg-panel';

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
