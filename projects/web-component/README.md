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
