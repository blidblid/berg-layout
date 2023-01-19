import { BergPanelInputs, BergPanelOutputBindingMode } from './panel-model';

type BergPanelInputUpdate = Partial<BergPanelInputs>;

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
