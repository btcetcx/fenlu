import { request } from '@/app/request/http';
import {
  operationSettingTemplates,
  type OperationApprovalRuleRow,
  type OperationPrintTemplateRow,
  type OperationSettingModule,
} from '@/app/templates/operation-settings-template';
import type { FieldSettingRow, StrategyTab } from '@/components/setting-page/types';

export interface OperationNumberRuleSetting {
  prefix: string;
  separator: string;
  selected: string[];
}

export interface OperationSettings {
  center: 'rd' | 'warehouse' | 'production';
  resource: string;
  fields: FieldSettingRow[];
  numberRule: OperationNumberRuleSetting;
  approvals: OperationApprovalRuleRow[];
  strategies: StrategyTab[];
  printTemplates: OperationPrintTemplateRow[];
}

export const operationSettingResourceMap: Record<OperationSettingModule, string> = Object.fromEntries(
  Object.entries(operationSettingTemplates).map(([module, template]) => [module, template.resource]),
) as Record<OperationSettingModule, string>;

export function getOperationSettings(module: OperationSettingModule, mode: 'mock' | 'remote' = 'mock') {
  const template = operationSettingTemplates[module];
  if (mode === 'mock') {
    const settings: OperationSettings = {
      center: template.center,
      resource: template.resource,
      fields: template.fields.rows.map((row) => ({ ...row })),
      numberRule: {
        prefix: template.numbers.prefix,
        separator: template.numbers.separator,
        selected: [...template.numbers.selected],
      },
      approvals: template.approvals.rows.map((row) => ({
        ...row,
        nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
      })),
      strategies: template.strategies.tabs.map((tab) => ({
        ...tab,
        rows: tab.rows.map((row) => ({ ...row, options: row.options ? [...row.options] : undefined })),
      })),
      printTemplates: template.print.rows.map((row) => ({ ...row })),
    };
    return Promise.resolve(settings);
  }
  return request<OperationSettings>({ url: `/${template.center}/settings/${template.resource}`, method: 'GET' });
}

export function saveOperationSettings(module: OperationSettingModule, data: OperationSettings, mode: 'mock' | 'remote' = 'mock') {
  const template = operationSettingTemplates[module];
  if (mode === 'mock') return Promise.resolve(data);
  return request<OperationSettings>({ url: `/${template.center}/settings/${template.resource}`, method: 'PATCH', data });
}
