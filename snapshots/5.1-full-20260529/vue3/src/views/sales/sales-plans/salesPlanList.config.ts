import type { AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';

export const salesPlanListConfig = {
  toolbar: {
    searchPlaceholder: '全局搜索（如计划名称、产品、负责人）',
    createLabel: '添加计划',
    actions: ['refresh', 'filter', 'columns', 'import', 'export', 'create'] as ToolbarActionKey[],
  },
  table: {
    rowKey: 'id',
    bulkActions: [
      { key: 'assign', label: '批量指定' },
      { key: 'submit', label: '批量提交' },
    ],
    columns: [
      { title: '计划名称', key: 'name', width: 240, link: true },
      { title: '计划编号', key: 'code', width: 150 },
      { title: '计划产品', key: 'productSummary', width: 180 },
      { title: '计划周期', key: 'cycle', width: 210 },
      { title: '负责对象', key: 'ownerName', width: 150 },
      { title: '目标数量', key: 'targetQuantity', width: 110, numeric: true },
      { title: '目标金额', key: 'targetAmount', width: 120, numeric: true },
      { title: '完成金额', key: 'doneAmount', width: 120, numeric: true },
      { title: '达成率', key: 'achievementText', width: 100 },
      { title: '计划状态', key: 'statusName', width: 150, filterOptions: ['未开始', '执行中', '已完成', '已暂停', '已关闭'] },
      { title: '操作', key: 'action', width: 90, fixed: 'right' },
    ] satisfies AwTableColumn[],
  },
};
