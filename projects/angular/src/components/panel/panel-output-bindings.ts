import { BergPanelInputs, BergPanelResizeSnap } from './panel-model';

type BergPanelInputUpdate = Partial<BergPanelInputs>;

export interface BergPanelOutputBinding {
  onResizeSnapped(resizeSnap: BergPanelResizeSnap): BergPanelInputUpdate;
  onBackdropClicked(event: MouseEvent): BergPanelInputUpdate;
}

export type BergPanelOutputBindingMode = 'auto' | 'noop';

export const BERG_PANEL_OUTPUT_BINDINGS: Record<
  BergPanelOutputBindingMode,
  BergPanelOutputBinding
> = {
  auto: {
    onResizeSnapped(resizeSnap: BergPanelResizeSnap) {
      return {
        resizeSnap,
      };
    },
    onBackdropClicked() {
      return {
        collapsed: true,
      };
    },
  },
  noop: {
    onResizeSnapped() {
      return {};
    },
    onBackdropClicked() {
      return {};
    },
  },
};
