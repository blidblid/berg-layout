# @berg-layout/web-component

This is the web-component version of berg-layout built using `@angular/elements`.

Check out the demo [here](https://berg-layout.web.app/web-component).

## Usage

First import the web-component. The import will call `customElements.define` and make `berg-layout` and `berg-panel` available.

```typescript
import '@berg-layout/web-component';
```

Then add a layout and place panels using the [slot attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot).

```html
<berg-layout>
  <berg-panel slot="left" absolute="true"></berg-panel>
  <berg-panel></berg-panel>
</berg-layout>
```

## Styles

To style the layout, install the [package](https://www.npmjs.com/package/@berg-layout/styling) `@berg-layout/styling`. Then use prebuilt `css` or `SASS`, for example:

```css
@import '~@berg-layout/styling/core.css';
@import '~@berg-layout/styling/dark.css';
```

For complete docs on styling, go to https://github.com/blidblid/berg-layout/tree/main/projects/styling.

## API

See https://berg-layout-api.web.app/angular/api. But remember that web-component attributes are kebab cased.

```html
<!-- 👍 -->
<berg-panel resize-disabled="true"></berg-panel>
```

```html
<!-- 👎 -->
<berg-panel resizeDisabled="true"></berg-panel>
```
