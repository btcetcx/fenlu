import type { AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';

export const salesQuoteListConfig = {
  tree: {
    title: '报价列表',
    rootLabel: '报价分类',
    categories: [
      { key: 'universal', label: '通用报价' },
      { key: 'group', label: '分组报价' },
      { key: 'promo', label: '促销报价' },
      { key: 'once', label: '一次性报价' },
    ],
  },
  toolbar: {
    searchPlaceholder: '全局搜索（如报价主题、编号、客户）',
    createLabel: '添加报价',
    actions: ['refresh', 'filter', 'columns', 'import', 'export', 'create'] as ToolbarActionKey[],
  },
  table: {
    rowKey: 'id',
    bulkActions: [
      { key: 'assign', label: '批量指定' },
      { key: 'submit', label: '批量提交' },
    ],
    columns: [
      { title: '报价主题', key: 'topic', width: 190, link: true },
      { title: '报价编号', key: 'code', width: 150 },
      { title: '报价类型', key: 'quoteTypeName', width: 120 },
      { title: '适用客户', key: 'customerName', width: 180 },
      { title: '报价金额', key: 'amount', width: 110, numeric: true },
      { title: '价格版本', key: 'priceVersion', width: 90 },
      { title: '转化状态', key: 'conversionStatusName', width: 110 },
      { title: '报价日期', key: 'quoteDate', width: 120 },
      { title: '失效日期', key: 'expireDate', width: 120 },
      { title: '报价人员', key: 'ownerName', width: 110 },
      { title: '报价状态', key: 'statusName', width: 150, filterOptions: ['审核中', '已批准', '已失效', '草稿'] },
      { title: '操作', key: 'action', width: 90, fixed: 'right' },
    ] satisfies AwTableColumn[],
  },
};
