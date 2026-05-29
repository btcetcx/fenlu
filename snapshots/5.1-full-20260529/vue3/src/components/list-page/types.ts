export type ToolbarActionKey = 'refresh' | 'filter' | 'columns' | 'import' | 'export' | 'create';

export interface AwTableColumn {
  key: string;
  title: string;
  width?: number;
  numeric?: boolean;
  link?: boolean;
  fixed?: 'right';
  filterOptions?: string[];
}

export interface AwBulkAction {
  key: string;
  label: string;
}

export interface AwTreeNode {
  key: string;
  label: string;
  count?: number;
  icon?: string;
  level?: 2 | 3;
  open?: boolean;
  disabled?: boolean;
}
