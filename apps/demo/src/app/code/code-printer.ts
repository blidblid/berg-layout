import { Injectable } from '@angular/core';
import { BergLayoutInputs, BergPanelInputs } from '@berg-layout/angular';
import {
  BergPanelSlot,
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/core';

@Injectable()
export abstract class CodePrinter {
  abstract importDeclaration: string;
  abstract layoutTagName: string;
  abstract panelTagName: string;
  abstract printInputs(inputs: object): string[];
  abstract startHtmlElement(tagName: string): string;
  abstract endHtmlElement(tagName: string): string;

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

  indent(str: string, spaces: number): string {
    return ' '.repeat(spaces) + str;
  }

  findChangedInputs(values: object, defaults: object): object {
    return Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== (defaults as Record<string, unknown>)[key]) {
        acc[key] = value;
      }

      return acc;
    }, {} as Record<string, unknown>);
  }
}
