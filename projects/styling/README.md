# Styling berg-layout

## css-classes

All styles in berg-layout are applied through css-classes. If you're looking to customize a layout from scratch, just add styles to these classes.

- Host classes
  - `.berg-layout`
  - `.berg-panel`
- Panel parts
  - `.berg-panel::part(overflow)`
  - `.berg-panel::part(content)`
- State classes
  - `.berg-panel-absolute`
  - `.berg-panel-hidden`
  - `.berg-panel-snap-expanded`
  - `.berg-panel-snap-collapsed`
- Resize classes
  - `.berg-panel-resize-resizing`
  - `.berg-panel-resize-previewing`
  - `.berg-panel-resize-disabled`
- Positional classes
  - `.berg-panel-vertical`
  - `.berg-panel-horizontal`
  - `.berg-panel-top`
  - `.berg-panel-left`
  - `.berg-panel-right`
  - `.berg-panel-bottom`
  - `.berg-panel-center`

## SASS API

To style berg-layout using SASS, first import the API.

```scss
@use 'node_modules/@berg-layout/styling' as layout;
```

### SASS themes

berg-layout comes with several pre-made themes.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

// dark themes
@include layout.abyss();
@include layout.dark-shades();

// light themes
@include layout.light-shades();
```

Another way of creating themes is to call `theme` passing a `map` of colors.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.theme(
  $colors: (
    background: rgb(30, 30, 30),
    background-low-contrast: rgb(37, 37, 38),
    background-high-contrast: rgb(60, 60, 60),
    background-backdrop: rgba(255, 255, 255, 0.3),
    divider: rgb(65, 65, 65),
  )
);
```

### SASS borders

To add borders, use the `borders` mixin.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.borders(1px solid grey);
```

### SASS elevation

To add elevation, use the `elevation` mixin.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

// Specify an elevation between 1 and 24.
.berg-panel-top {
  @include layout.elevation(4);
}
```

### SASS resizing

To customize resizing styles, use the `resizing` mixin, passing a `map` of styles.

```scss
@use 'node_modules/@berg-layout/styling' as layout;

@include layout.resizing(
  (
    'resizing-indicator-width': 6px,
    'previewing-indicator-color': orange,
    'resizing-indicator-color': blue,
  )
);
```
