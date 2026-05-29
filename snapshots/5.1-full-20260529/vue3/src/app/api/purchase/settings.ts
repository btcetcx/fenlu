import { request } from '@/app/request/http';
import { purchaseSettingTemplates, type ApprovalRuleRow, type PurchaseSettingModule } from '@/app/templates/purchase-settings-template';
import type { FieldSettingRow, StrategyTab } from '@/components/setting-page/types';
import type { PrintTemplateRow } from '@/app/templates/purchase-settings-template';

export interface PurchaseNumberRuleSetting {
  prefix: string;
  separator: string;
  selected: string[];
}

export interface PurchaseSettings {
  resource: string;
  fields: FieldSettingRow[];
  numberRule: PurchaseNumberRuleSetting;
  approvals: ApprovalRuleRow[];
  strategies: StrategyTab[];
  printTemplates: PrintTemplateRow[];
}

export const purchaseSettingResourceMap: Record<PurchaseSettingModule, string> = {
  suppliers: 'suppliers',
  requests: 'purchase-requests',
  inquiries: 'purchase-inquiries',
  orders: 'purchase-orders',
};

export function getPurchaseSettings(module: PurchaseSettingModule, mode: 'mock' | 'remote' = 'mock') {
  const resource = purchaseSettingResourceMap[module];
  if (mode === 'mock') {
    const template = purchaseSettingTemplates[module];
    const settings: PurchaseSettings = {
      resource,
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
  return request<PurchaseSettings>({ url: `/${resource}/settings`, method: 'GET' });
}

export function savePurchaseSettings(module: PurchaseSettingModule, data: PurchaseSettings, mode: 'mock' | 'remote' = 'mock') {
  const resource = purchaseSettingResourceMap[module];
  if (mode === 'mock') return Promise.resolve(data);
  return request<PurchaseSettings>({ url: `/${resource}/settings`, method: 'PATCH', data });
}
