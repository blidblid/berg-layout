import { BergPanelInputs } from './panel-model';

export type BergPanelNullableInputs = {
  [P in keyof BergPanelInputs]: BergPanelInputs[P] | null;
};
