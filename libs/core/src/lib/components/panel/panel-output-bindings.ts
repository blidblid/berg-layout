import { BergPanelAttributes, BergPanelOutputBindingMode } from './panel-model';

type BergPanelInputUpdate = Partial<BergPanelAttributes>;

export interface BergPanelOutputBinding {
  onBackdropClicked(event: MouseEvent): BergPanelInputUpdate;
}

export const BERG_PANEL_OUTPUT_BINDINGS: Record<
  BergPanelOutputBindingMode,
  BergPanelOutputBinding
> = {
  auto: {
    onBackdropClicked() {
      return {
        collapsed: true,
      };
    },
  },
  noop: {
    onBackdropClicked() {
      return {};
    },
  },
};
