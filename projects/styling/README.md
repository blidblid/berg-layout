# Styling berg-layout

## css-classes

All styles in berg-layout are applied through css-classes. If you're looking to customize a layout from scratch, just add styles to these classes.

- Static classes
  - `.berg-layout`
  - `.berg-panel`
  - `.berg-panel-backdrop`
- Layout parts
  - `.berg-layout::part(flex)`
  - `.berg-layout::part(inner-flex)`
- Panel parts
  - `.berg-panel::part(overflow)`
  - `.berg-panel::part(content)`
- State classes
  - `.berg-panel-absolute`
  - `.berg-panel-hidden`
- Resize classes
  - `.berg-panel-resize-resizing`
  - `.berg-panel-resize-previewing`
  - `.berg-panel-resize-disabled`
  - `.berg-panel-resize-toggle`
  - `.berg-panel-resize-toggle-top`
  - `.berg-panel-resize-toggle-right`
  - `.berg-panel-resize-toggle-bottom`
  - `.berg-panel-resize-toggle-left`
- Positional classes
  - `.berg-panel-vertical`
  - `.berg-panel-horizontal`
  - `.berg-panel-top`
  - `.berg-panel-left`
  - `.berg-panel-right`
  - `.berg-panel-bottom`
  - `.berg-panel-center`

## Prebuilt themes

The quickest way to style berg-layout is to use prebuilt css. Start with importing `core.css`.

```css
@import '~@berg-layout/styling/core.css';
```

Then, import a theme.

```css
@import '~@berg-layout/styling/dark.css';
```

There are 9 themes to choose from

- Abyss
- Dark
- High Contrast
- Light
- Material Dark
- Material Light
- Quiet Light
- Solarized Dark
- Solarized Light

## SASS API

### Core styles

To style berg-layout using SASS, first `@use` the layout API. Then, include the core-mixin, optionally passing overrides.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.core(
  $overrides: (
    resizing-indicator-size: 6px,
  )
);
```

### Themes

Pick a theme and include it using its theme-mixin. Optionally, pass overrides.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.solarized-light(
  $overrides: (
    resizing-indicator-color: #3b7fd0,
    elevation: 0,
  )
);
```

A lower level way of creating themes is to call the `theme`-mixin with `map` of colors.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.theme(
  $colors: (
    background: rgb(30, 30, 30),
    background-low-contrast: rgb(37, 37, 38),
    background-high-contrast: rgb(60, 60, 60),
    background-backdrop: rgba(255, 255, 255, 0.3),
    divider: rgb(65, 65, 65),
    resizing-indicator-color: #ff9100,
    previewing-indicator-color: #006eff,
  )
);
```

### Borders

To add borders, use the `border` mixin.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.border(1px solid grey);
```

To add borders to some panels, use the `border-parts` mixin.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.border-parts(
  (
    top: 1px solid grey,
  )
);
```

### Elevation

To add elevation, use the `elevation` mixin.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

// Specify an elevation between 1 and 24.
.berg-panel-top {
  @include layout.elevation(4);
}
```
