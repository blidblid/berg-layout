import { BergPanelInputs, BergPanelSnap } from './panel-model';

type BergPanelInputUpdate = Partial<BergPanelInputs>;

export interface BergPanelOutputBinding {
  onSnapped(snap: BergPanelSnap): BergPanelInputUpdate;
  onBackdropClicked(event: MouseEvent): BergPanelInputUpdate;
}

export type BergPanelOutputBindingMode = 'auto' | 'noop';

export const BERG_PANEL_OUTPUT_BINDINGS: Record<
  BergPanelOutputBindingMode,
  BergPanelOutputBinding
> = {
  auto: {
    onSnapped(snap: BergPanelSnap) {
      return {
        snap: snap,
      };
    },
    onBackdropClicked() {
      return {
        collapsed: true,
      };
    },
  },
  noop: {
    onSnapped() {
      return {};
    },
    onBackdropClicked() {
      return {};
    },
  },
};
