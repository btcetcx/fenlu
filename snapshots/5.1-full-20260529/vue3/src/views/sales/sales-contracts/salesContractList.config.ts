import type { AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';

export const salesContractListConfig = {
  toolbar: {
    searchPlaceholder: '全局搜索（如合同主题、合同编号、客户）',
    createLabel: '添加合同',
    actions: ['refresh', 'filter', 'columns', 'import', 'export', 'create'] as ToolbarActionKey[],
  },
  table: {
    rowKey: 'id',
    bulkActions: [
      { key: 'assign', label: '批量指定' },
      { key: 'submit', label: '批量提交' },
    ],
    columns: [
      { title: '合同主题', key: 'topic', width: 180, link: true },
      { title: '合同编号', key: 'code', width: 150 },
      { title: '客户', key: 'customerName', width: 180 },
      { title: '来源单据', key: 'sourceCode', width: 150 },
      { title: '合同金额', key: 'amount', width: 110, numeric: true },
      { title: '已下单金额', key: 'orderedAmount', width: 110, numeric: true },
      { title: '已发货金额', key: 'shippedAmount', width: 110, numeric: true },
      { title: '应收金额', key: 'receivableAmount', width: 110, numeric: true },
      { title: '已开票金额', key: 'invoiceAmount', width: 110, numeric: true },
      { title: '已回款金额', key: 'receivedAmount', width: 110, numeric: true },
      { title: '剩余金额', key: 'balanceAmount', width: 110, numeric: true },
      { title: '签订日期', key: 'signedDate', width: 120 },
      { title: '失效日期', key: 'expireDate', width: 120 },
      { title: '销售人员', key: 'ownerName', width: 110 },
      { title: '履约状态', key: 'executionStatusName', width: 150, filterOptions: ['待审批', '履约中', '履约完成', '已终止'] },
      { title: '操作', key: 'action', width: 90, fixed: 'right' },
    ] satisfies AwTableColumn[],
  },
};
