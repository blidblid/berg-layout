import { BergLayoutInputs } from './layout-model';

export type BergLayoutComponentInputs = {
  [P in keyof BergLayoutInputs]: BergLayoutInputs[P] | null;
};
