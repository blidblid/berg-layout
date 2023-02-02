import { RequireAll } from '../web-component-model';
import {
  BergPanelAttributes,
  BergPanelAttributesCamelCased,
} from './panel-model';

export const BERG_PANEL_TAG_NAME = 'berg-panel-web-component';

/** Default attributes of berg-panel. */
export const BERG_PANEL_DEFAULTS: RequireAll<BergPanelAttributes> = {
  slot: 'center',
  absolute: false,
  collapsed: false,
  'resize-disabled': false,
  'event-binding-mode': 'auto',
  size: 100,
  'min-size': 50,
  'max-size': null,
};

/** Default camel cased attributes of berg-panel. */
export const BERG_PANEL_DEFAULTS_CAMEL_CASED: RequireAll<BergPanelAttributesCamelCased> =
  {
    slot: BERG_PANEL_DEFAULTS['slot'],
    absolute: BERG_PANEL_DEFAULTS['absolute'],
    collapsed: BERG_PANEL_DEFAULTS['collapsed'],
    resizeDisabled: BERG_PANEL_DEFAULTS['resize-disabled'],
    eventBindingMode: BERG_PANEL_DEFAULTS['event-binding-mode'],
    size: BERG_PANEL_DEFAULTS['size'],
    minSize: BERG_PANEL_DEFAULTS['min-size'],
    maxSize: BERG_PANEL_DEFAULTS['max-size'],
  };
