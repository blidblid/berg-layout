import { BergPanelAttributes, BergPanelEventBindingMode } from './panel-model';

type BergPanelAttributeUpdate = Partial<BergPanelAttributes>;

export interface BergPanelEventBinding {
  onBackdropClicked(event: MouseEvent): BergPanelAttributeUpdate;
}

export const BERG_PANEL_EVENT_BINDINGS: Record<
  BergPanelEventBindingMode,
  BergPanelEventBinding
> = {
  auto: {
    onBackdropClicked() {
      return {
        collapsed: true,
      };
    },
  },
  none: {
    onBackdropClicked() {
      return {};
    },
  },
};
