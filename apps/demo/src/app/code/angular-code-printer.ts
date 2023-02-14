import { CodePrinter } from './code-printer';

export class AngularCodePrinter extends CodePrinter {
  importDeclaration = `import { BergLayoutModule } from '@berg-layout/angular';`;
  layoutTagName = 'berg-layout';
  panelTagName = 'berg-panel';

  printInputs(inputs: object): string[] {
    return Object.entries(inputs).map(([key, value]) => {
      return `${key}="${value}"`;
    });
  }

  startHtmlElement(tagName: string): string {
    return `<${tagName}`;
  }

  endHtmlElement(tagName: string): string {
    return `</${tagName}>`;
  }
}
