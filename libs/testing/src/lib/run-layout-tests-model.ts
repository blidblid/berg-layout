import { BergLayoutInputs, BergPanelInputs } from '@berg-layout/core';

export interface RenderInputs {
  layout: Partial<BergLayoutInputs>;
  top: Partial<BergPanelInputs>;
  right: Partial<BergPanelInputs>;
  bottom: Partial<BergPanelInputs>;
  left: Partial<BergPanelInputs>;
}

export type Render = (inputs: Partial<RenderInputs>) => Promise<unknown>;
