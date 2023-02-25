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
  slot: 'center',
  absolute: false,
  collapsed: false,
  resizeDisabled: false,
  eventBindingMode: 'auto',
  size: 100,
  minSize: 50,
  maxSize: null,
};

export const BERG_PANEL_ATTRIBUTE_BY_INPUT: WebComponentAttributeByInput<BergPanelInputs> =
  {
    slot: 'slot',
    absolute: 'absolute',
    collapsed: 'collapsed',
    resizeDisabled: 'resize-disabled',
    eventBindingMode: 'event-binding-mode',
    size: 'size',
    minSize: 'min-size',
    maxSize: 'max-size',
  };

export const BERG_PANEL_INPUT_BY_ATTRIBUTE: WebComponentInputByAttribute<BergPanelInputs> =
  reverseObject(BERG_PANEL_ATTRIBUTE_BY_INPUT);
