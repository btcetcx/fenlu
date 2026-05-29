import type { AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';

export const salesOrderListConfig = {
  toolbar: {
    searchPlaceholder: '全局搜索（如订单主题、订单号、客户）',
    createLabel: '添加订单',
    actions: ['refresh', 'filter', 'columns', 'import', 'export', 'create'] as ToolbarActionKey[],
  },
  table: {
    rowKey: 'id',
    bulkActions: [
      { key: 'assign', label: '批量指定' },
      { key: 'submit', label: '批量提交' },
    ],
    columns: [
      { title: '订单主题', key: 'topic', width: 170, link: true },
      { title: '订单号', key: 'code', width: 150 },
      { title: '订单来源', key: 'sourceCode', width: 150 },
      { title: '合同来源', key: 'contractSource', width: 120 },
      { title: '客户', key: 'customerName', width: 180 },
      { title: '订单金额', key: 'amount', width: 120, numeric: true },
      { title: '信用校验', key: 'creditCheckName', width: 100 },
      { title: '信用占用', key: 'creditHoldName', width: 100 },
      { title: '应收金额', key: 'receivableAmount', width: 110, numeric: true },
      { title: '开票申请', key: 'invoiceRequestName', width: 100 },
      { title: '已回款', key: 'receivedAmount', width: 110, numeric: true },
      { title: '订单状态', key: 'statusName', width: 150, filterOptions: ['草稿', '审核中', '已批准', '已确认', '生产中', '已取消'] },
      { title: '异常标签', key: 'exceptionTag', width: 100 },
      { title: '下单日期', key: 'orderDate', width: 120 },
      { title: '交货日期', key: 'deliveryDate', width: 120 },
      { title: '销售人员', key: 'ownerName', width: 110 },
      { title: '订单进展', key: 'progressName', width: 150, filterOptions: ['未发货', '部分发货', '发货中', '已发货', '已完成', '生产中'] },
      { title: '操作', key: 'action', width: 90, fixed: 'right' },
    ] satisfies AwTableColumn[],
  },
};
