export interface DetailAction {
  key: string;
  label: string;
  danger?: boolean;
}

export interface DetailMetaItem {
  label: string;
  value: string;
}

export interface DetailTabItem {
  key: string;
  label: string;
}

export interface DetailFieldItem {
  label: string;
  value: string;
}

export interface DetailMetricItem {
  label: string;
  value: number | string;
}
