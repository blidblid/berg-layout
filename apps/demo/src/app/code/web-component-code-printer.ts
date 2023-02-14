import { CodePrinter } from './code-printer';

export class WebComponentCodePrinter extends CodePrinter {
  importDeclaration = `import '@berg-layout/core';`;
  layoutTagName = 'berg-layout-web-component';
  panelTagName = 'berg-panel-web-component';

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
