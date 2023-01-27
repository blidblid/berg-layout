import {
  BERG_LAYOUT_DEFAULT_INPUTS,
  BERG_PANEL_DEFAULT_INPUTS,
} from '@berg-layout/angular';
import { Layout, Panel } from './layout-model';

export function toScss(theme: string): string {
  const themeId = toThemeId(theme);
  return [
    `@use 'node_modules/@berg-layout/styling' as layout;`,
    '',
    '@include layout.core();',
    `@include layout.${themeId}();`,
  ].join('\n');
}

export function toCss(theme: string): string {
  const themeId = toThemeId(theme);
  return [
    `@import '~@berg-layout/styling/core.css';`,
    `@import '~@berg-layout/styling/${themeId}.css';`,
  ].join('\n');
}

function toThemeId(theme: string): string {
  return theme.toLowerCase().replace(/\s/g, '-');
}

export function toHtml(
  layout: Layout,
  inputPrinter: (key: string, value: unknown) => string,
  panelTagName: string,
  layoutTagName: string
): string {
  const layoutInputs = toInputs(layout, BERG_LAYOUT_DEFAULT_INPUTS);

  const panelElements = [layout.top, layout.left, layout.right, layout.bottom]
    .filter((panel): panel is Panel => !!panel && !panel.remove)
    .map((panel) => {
      return (
        startElement(
          panelTagName,
          toInputs(panel, BERG_PANEL_DEFAULT_INPUTS),
          inputPrinter,
          2
        ) + endElement(panelTagName, 2)
      );
    });

  let html = startElement(layoutTagName, layoutInputs, inputPrinter) + '\n';

  for (const panelElement of panelElements) {
    html += panelElement;
  }

  return html + endElement(layoutTagName).trim();
}

export function angularInputPrinter(key: string, value: unknown): string {
  if (typeof value !== 'string') {
    key = `[${key}]`;
  }

  return `${key}="${value}"`;
}

export function webComponentInputPrinter(key: string, value: unknown): string {
  return `${camelCaseToKebabCase(key)}="${value}"`;
}

function startElement(
  tagName: string,
  inputs: [string, any][],
  printer: (key: string, value: any) => string,
  indentLevel = 0
) {
  const parentIndent = toIndentation(indentLevel);
  let html = parentIndent + `<${tagName}`;
  const childIndent = toIndentation(html.length);

  for (let i = 0; i < inputs.length; i++) {
    const [key, value] = inputs[i];
    html = html + ' ' + printer(key, value);

    if (i !== inputs.length - 1) {
      html = html + '\n' + childIndent;
    }
  }

  return html + '>\n';
}

function endElement(tagName: string, indentLevel = 0) {
  const parentIndent = toIndentation(indentLevel);
  return parentIndent + `</${tagName}>\n\n`;
}

function toIndentation(level: number): string {
  return Array.from({ length: level }).fill(' ').join('');
}

function camelCaseToKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function toInputs(
  object: Record<string, any>,
  defaults: Record<string, any>
): [string, string][] {
  const inputs: [string, any][] = [];

  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'object' || key === 'remove') {
      continue;
    }

    if (value !== defaults[key]) {
      inputs.push([key, value]);
    }
  }

  return inputs;
}
