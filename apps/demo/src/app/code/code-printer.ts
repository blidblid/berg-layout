import { Injectable } from '@angular/core';
import { BergLayoutInputs, BergPanelSlot } from '@berg-layout/core';

@Injectable()
export abstract class CodePrinter {
  abstract importDeclaration: string;

  abstract printHtml(
    layout: Partial<BergLayoutInputs>,
    panels: Partial<Record<BergPanelSlot, Partial<BergLayoutInputs>>>
  ): string;

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

  toSingleQuoteJsonString(str: string): string {
    return JSON.stringify(str).replace(/"/g, "'");
  }
}
