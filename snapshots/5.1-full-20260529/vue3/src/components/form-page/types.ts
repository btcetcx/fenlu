export interface FormAction {
  key: string;
  label: string;
  primary?: boolean;
}

export interface EditableColumn {
  key: string;
  title: string;
  width?: number;
}

export interface PaymentTermItem {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
  tip?: string;
}
