import { CodePrinter } from './code-printer';

export class ReactCodePrinter extends CodePrinter {
  importDeclaration = `import { BergLayout, BergPanel } from '@berg-layout/react';`;
  layoutTagName = 'BergLayout';
  panelTagName = 'BergPanel';

  printInputs(inputs: object): string[] {
    return Object.entries(inputs).map(([key, value]) => {
      return `${key}={${value}}`;
    });
  }

  startHtmlElement(tagName: string): string {
    return `<${tagName}`;
  }

  endHtmlElement(): string {
    return `</>`;
  }
}
