import { BergPanelSlot } from './panel-model';

export const BERG_PANEL_ABSOLUTE_CLASS = 'berg-panel-absolute';
export const BERG_PANEL_COLLAPSED_CLASS = 'berg-panel-collapsed';
export const BERG_PANEL_HORIZONTAL_CLASS = 'berg-panel-horizontal';
export const BERG_PANEL_NO_TRANSITION_CLASS = 'berg-panel-no-transition';
export const BERG_PANEL_PREVIEWING_CLASS = 'berg-panel-previewing';
export const BERG_PANEL_RESIZE_DISABLED_CLASS = 'berg-panel-resize-disabled';
export const BERG_PANEL_RESIZING_CLASS = 'berg-panel-resizing';
export const BERG_PANEL_CLASS = 'berg-panel';
export const BERG_PANEL_VERTICAL_CLASS = 'berg-panel-vertical';

export const BERG_PANEL_CLASSES_BY_SLOT: Record<BergPanelSlot, string> = {
  center: 'berg-panel-center',
  top: 'berg-panel-top',
  right: 'berg-panel-right',
  bottom: 'berg-panel-bottom',
  left: 'berg-panel-left',
};

export const BERG_PANEL_ENABLE_ANIMATION_DELAY = 1000;
