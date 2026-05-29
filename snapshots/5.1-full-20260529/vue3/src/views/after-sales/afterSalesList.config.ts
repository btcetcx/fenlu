import type { AwBulkAction, AwTableColumn } from '@/components/list-page/types';
import { afterSalesTypeOptions } from '@/app/api/after-sales/dictionaries';

export const serviceColumns: AwTableColumn[] = [
  { key: 'topic', title: '售后主题', width: 220, link: true },
  { key: 'code', title: '售后单号', width: 150 },
  { key: 'customerName', title: '客户', width: 190 },
  { key: 'sourceOrder', title: '来源订单', width: 150 },
  { key: 'sourceDelivery', title: '来源发货单', width: 150 },
  { key: 'sourceLine', title: '来源明细', width: 180 },
  { key: 'afterSalesType', title: '售后类型', width: 110, filterOptions: [...afterSalesTypeOptions] },
  { key: 'handlingMethod', title: '处理方式', width: 110 },
  { key: 'availableQuantity', title: '可售后数量', width: 110, numeric: true },
  { key: 'refundableAmount', title: '可退金额', width: 120, numeric: true },
  { key: 'sla', title: 'SLA', width: 110 },
  { key: 'warehouseStatus', title: '仓储处理', width: 110 },
  { key: 'financeStatus', title: '财务处理', width: 110 },
  { key: 'invoiceStatus', title: '发票处理', width: 110 },
  { key: 'closeConfirmStatus', title: '结单确认', width: 120 },
  { key: 'qualityStatus', title: '质量联动', width: 130 },
  { key: 'priority', title: '优先级', width: 90, filterOptions: ['高', '中', '低'] },
  { key: 'ownerName', title: '负责人', width: 100 },
  { key: 'submittedAt', title: '提交时间', width: 160 },
  { key: 'statusName', title: '售后状态', width: 140, filterOptions: ['待受理', '处理中', '待结单确认', '已关闭', '已关闭/质量追踪中', '异常升级'] },
  { key: 'action', title: '操作', width: 180, fixed: 'right' },
];

export const serviceBulkActions: AwBulkAction[] = [
  { key: 'assign', label: '批量指派' },
  { key: 'export', label: '批量导出' },
];

export const taskColumns: AwTableColumn[] = [
  { key: 'code', title: '任务编号', width: 150 },
  { key: 'topic', title: '任务主题', width: 240, link: true },
  { key: 'serviceCode', title: '关联售后单', width: 150 },
  { key: 'customerName', title: '客户', width: 190 },
  { key: 'taskType', title: '任务类型', width: 120, filterOptions: ['退货入库', '换货出库', '配件出库', '退款处理', '维修派工', '现场服务'] },
  { key: 'department', title: '责任部门', width: 110 },
  { key: 'ownerName', title: '责任人', width: 110 },
  { key: 'linkedDocumentCode', title: '派生单据', width: 160 },
  { key: 'linkedDocumentStatus', title: '派生单据状态', width: 130 },
  { key: 'dueAt', title: '截止时间', width: 110 },
  { key: 'status', title: '任务状态', width: 110 },
  { key: 'action', title: '操作', width: 110, fixed: 'right' },
];

export const qualityColumns: AwTableColumn[] = [
  { key: 'code', title: '改进单号', width: 150 },
  { key: 'topic', title: '质量主题', width: 240, link: true },
  { key: 'serviceCode', title: '来源售后单', width: 150 },
  { key: 'customerName', title: '客户/来源', width: 190 },
  { key: 'problemType', title: '问题类型', width: 120 },
  { key: 'stage', title: '当前阶段', width: 120, filterOptions: ['D1组建团队', 'D4根因分析', 'CAPA执行', '效果验证', '已关闭'] },
  { key: 'eightDCode', title: '8D编号', width: 150 },
  { key: 'capaCode', title: 'CAPA编号', width: 160 },
  { key: 'ownerName', title: '负责人', width: 100 },
  { key: 'status', title: '状态', width: 110 },
  { key: 'action', title: '操作', width: 110, fixed: 'right' },
];
