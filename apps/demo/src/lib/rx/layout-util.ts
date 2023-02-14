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
