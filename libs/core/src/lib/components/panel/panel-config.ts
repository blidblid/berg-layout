import { reverseObject } from '../../util';
import {
  RequireAll,
  WebComponentAttributeByInput,
  WebComponentInputByAttribute,
} from '../web-component-model';
import { BergPanelInputs } from './panel-model';

export const BERG_PANEL_TAG_NAME = 'berg-panel-web-component';

/** Default attributes of berg-panel. */
export const BERG_PANEL_DEFAULT_INPUTS: RequireAll<BergPanelInputs> = {
  slot: 'right',
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  size: 100,
  minSize: 50,
  maxSize: null,
  animationDisabled: false,
  hideBackdrop: false,
  gesturesDisabled: false,
};

export const BERG_PANEL_COLLAPSE_GESTURE_FRACTIONAL_THRESHOLD = 0.8;
export const BERG_PANEL_COLLAPSE_GESTURE_THRESHOLD = 100;
export const BERG_PANEL_EXPAND_GESTURE_THRESHOLD = 80;
export const BERG_PANEL_GESTURE_ZONE_SIZE = 200;

export const BERG_PANEL_ATTRIBUTE_BY_INPUT: WebComponentAttributeByInput<BergPanelInputs> =
  {
    slot: 'slot',
    absolute: 'absolute',
    collapsed: 'collapsed',
    resizeDisabled: 'resize-disabled',
    size: 'size',
    minSize: 'min-size',
    maxSize: 'max-size',
    animationDisabled: 'animation-disabled',
    hideBackdrop: 'hide-backdrop',
    gesturesDisabled: 'gestures-disabled',
  };

export const BERG_PANEL_INPUT_BY_ATTRIBUTE: WebComponentInputByAttribute<BergPanelInputs> =
  reverseObject(BERG_PANEL_ATTRIBUTE_BY_INPUT);
