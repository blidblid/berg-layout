# @berg-layout/angular

This is the Angular version of berg-layout.

Check out the demo [here](https://berg-layout.web.app/angular).

## Usage

First import the module.

```typescript
import { BergLayoutModule } from '@berg-layout/angular';

@NgModule({
  imports: [BergLayoutModule],
})
export class LayoutModule {}
```

Then add a layout and place panels using the [slot attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot).

```html
<berg-layout>
  <berg-panel slot="left" absolute="true"></berg-panel>
  <berg-panel></berg-panel>
</berg-layout>
```

## Styles

To style the layout, install the `@berg-layout/styling` [package](https://www.npmjs.com/package/@berg-layout/styling). Then use prebuilt `css` or `SASS`, for example:

```css
@import '~@berg-layout/styling/core.css';
@import '~@berg-layout/styling/dark.css';
```

For complete docs on styling, go to https://github.com/blidblid/berg-layout/tree/main/projects/styling.

## API

See https://berg-layout-api.web.app/angular/api.
