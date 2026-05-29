export interface SettingTreeItem {
  key: string | number;
  label: string;
  count?: number;
  icon?: string;
}

export interface SettingTableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface SettingTableRow {
  id: string | number;
  [key: string]: unknown;
}

export interface SettingFormField {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'switch' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FieldSettingScope {
  key: string;
  label: string;
  count?: number;
}

export interface FieldSettingRow extends SettingTableRow {
  name: string;
  code: string;
  type: string;
  scope: string;
  required?: boolean | string;
  enabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  permissions?: Array<PersonPickerPerson & { visible?: boolean }>;
}

export interface CodeRuleCandidate {
  key: string;
  label: string;
  preview: string;
  fixed?: boolean;
  group?: string;
  editable?: boolean;
}

export interface ApprovalNode {
  name: string;
  approvers: string[];
  method: string;
}

export interface ApprovalMethod {
  value: string;
  desc?: string;
}

export interface StrategyRule {
  key: string;
  title: string;
  sub?: string;
  type?: 'switch' | 'select';
  value?: string;
  enabled?: boolean;
  options?: string[];
}

export interface StrategyTab {
  key: string;
  label: string;
  rows: StrategyRule[];
}

export interface PersonPickerPerson {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  dept?: string;
}

export interface PersonPickerDept {
  key: string;
  label: string;
  persons: PersonPickerPerson[];
}
