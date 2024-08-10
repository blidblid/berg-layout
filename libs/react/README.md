# @berg-layout/react

This is the React version of berg-layout.

## Usage

Usage and demo [here](https://berglayout.com/react).

## Documentation

- Panel inputs and outputs [here](https://github.com/blidblid/berg-layout/blob/main/libs/core/src/lib/components/panel/panel-model.ts)
- Layout inputs and outputs [here](https://github.com/blidblid/berg-layout/blob/main/libs/core/src/lib/components/layout/layout-model.ts)

## Styling

Since berg-layout uses web components, the layout styles are encapsulated in the [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM).

You can still style them, but you need to use the pseudo element [::part()](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) to pierce the encapsulation.

### Styling panels

The panels have two `::part()`

- `part="content"` which wraps your content
- `part="overflow"` which handles overflow and wraps `content`

To for example, style `content`, use `::part`

```css
.berg-panel-top {
  &::part(content) {
    padding: 16px;
  }
}
```
