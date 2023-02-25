import { reverseObject } from '../../util';
import {
  WebComponentAttributeByInput,
  WebComponentInputByAttribute,
} from '../web-component-model';
import { BergLayoutInputs } from './layout-model';

export const BERG_LAYOUT_TAG_NAME = 'berg-layout-web-component';

/** Default attributes of berg-layout. */
export const BERG_LAYOUT_DEFAULT_INPUTS: BergLayoutInputs = {
  resizeDisabled: false,
  resizeTwoDimensions: true,
  resizePreviewDelay: 200,
  topLeftPosition: 'above',
  topRightPosition: 'above',
  bottomLeftPosition: 'below',
  bottomRightPosition: 'below',
  topInset: 0,
  rightInset: 0,
  bottomInset: 0,
  leftInset: 0,
};

export const BERG_LAYOUT_ATTRIBUTE_BY_INPUT: WebComponentAttributeByInput<BergLayoutInputs> =
  {
    resizeDisabled: 'resize-disabled',
    resizeTwoDimensions: 'resize-two-dimensions',
    resizePreviewDelay: 'resize-preview-delay',
    topLeftPosition: 'top-left-position',
    topRightPosition: 'top-right-position',
    bottomLeftPosition: 'bottom-left-position',
    bottomRightPosition: 'bottom-right-position',
    topInset: 'top-inset',
    rightInset: 'right-inset',
    bottomInset: 'bottom-inset',
    leftInset: 'left-inset',
  };

export const BERG_LAYOUT_INPUT_BY_ATTRIBUTE: WebComponentInputByAttribute<BergLayoutInputs> =
  reverseObject(BERG_LAYOUT_ATTRIBUTE_BY_INPUT);
