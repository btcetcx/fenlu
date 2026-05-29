import type { AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';

export const customerListConfig = {
  tree: {
    title: '客户库',
    rootLabel: '客户分组',
    groups: ['重点客户', '战略客户', '普通客户', '渠道客户'],
  },
  toolbar: {
    searchPlaceholder: '全局搜索（如客户名称、联系人、客户经理）',
    createLabel: '新增客户',
    actions: ['refresh', 'filter', 'columns', 'import', 'export', 'create'] as ToolbarActionKey[],
  },
  table: {
    rowKey: 'id',
    bulkActions: [
      { key: 'transfer', label: '批量转移' },
      { key: 'assign', label: '批量指定' },
    ],
    columns: [
      { title: '客户名称', key: 'name', width: 220, link: true },
      { title: '客户分组', key: 'groupName', width: 120 },
      { title: '主联系人', key: 'contactName', width: 100 },
      { title: '职位', key: 'contactPosition', width: 110 },
      { title: '联系方式', key: 'contactPhone', width: 130, numeric: true },
      { title: '信用额度', key: 'creditLimit', width: 120, numeric: true },
      { title: '已用额度', key: 'creditUsed', width: 120, numeric: true },
      { title: '占用额度', key: 'creditHold', width: 120, numeric: true },
      { title: '应收未收', key: 'receivableAmount', width: 120, numeric: true },
      { title: '可用额度', key: 'creditAvailable', width: 120, numeric: true },
      { title: '账期', key: 'paymentTerm', width: 110 },
      { title: '信用状态', key: 'creditStatusName', width: 100 },
      { title: '客户经理', key: 'managerName', width: 110 },
      { title: '操作', key: 'action', width: 90, fixed: 'right' },
    ] satisfies AwTableColumn[],
  },
};
