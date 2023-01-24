export type EditorView = 'none' | 'edit' | 'code';

export interface EditorNavItem {
  view: EditorView;
  icon: string;
  description: string;
}
