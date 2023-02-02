import {
  BergLayoutAttributes,
  BergLayoutAttributesCamelCased,
} from './layout-model';

export const BERG_LAYOUT_TAG_NAME = 'berg-layout-web-component';

/** Default attributes of berg-layout. */
export const BERG_LAYOUT_DEFAULTS: BergLayoutAttributes = {
  'resize-disabled': false,
  'resize-two-dimensions': true,
  'resize-preview-delay': 200,
  'top-left-position': 'above',
  'top-right-position': 'above',
  'bottom-left-position': 'below',
  'bottom-right-position': 'below',
  'top-inset': 0,
  'right-inset': 0,
  'bottom-inset': 0,
  'left-inset': 0,
};

/** Default camel cased attributes of berg-layout. */
export const BERG_LAYOUT_DEFAULTS_CAMEL_CASED: BergLayoutAttributesCamelCased =
  {
    resizeDisabled: BERG_LAYOUT_DEFAULTS['resize-disabled'],
    resizeTwoDimensions: BERG_LAYOUT_DEFAULTS['resize-two-dimensions'],
    resizePreviewDelay: BERG_LAYOUT_DEFAULTS['resize-preview-delay'],
    topLeftPosition: BERG_LAYOUT_DEFAULTS['top-left-position'],
    topRightPosition: BERG_LAYOUT_DEFAULTS['top-right-position'],
    bottomLeftPosition: BERG_LAYOUT_DEFAULTS['bottom-left-position'],
    bottomRightPosition: BERG_LAYOUT_DEFAULTS['bottom-right-position'],
    topInset: BERG_LAYOUT_DEFAULTS['top-inset'],
    rightInset: BERG_LAYOUT_DEFAULTS['right-inset'],
    bottomInset: BERG_LAYOUT_DEFAULTS['bottom-inset'],
    leftInset: BERG_LAYOUT_DEFAULTS['left-inset'],
  };
