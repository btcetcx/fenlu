import type { AfterSalesDictionary, AfterSalesType, HandlingMethod } from './types';

export const afterSalesReasonOptions = ['包装破损', '产品故障', '少发/错发', '客户误购', '价格差异', '服务投诉'];

export const afterSalesComplaintOptions = ['做工粗糙/有瑕疵', '无法开机', '温控异常', '显示异常', '包装破损', '配件缺失'];

export const afterSalesTypeCards: Array<{ key: AfterSalesType; title: string; desc: string; owners: string }> = [
  { key: '退款退货', title: '退款退货', desc: '需要退回实物，并触发退款、应收冲减或发票红冲。', owners: '仓储 / 财务 / 售后' },
  { key: '仅退款', title: '仅退款', desc: '不退回实物，只处理差价、赔付或服务补偿退款。', owners: '财务 / 售后' },
  { key: '换货', title: '换货', desc: '先退回问题品，再换出新货并跟踪物流签收。', owners: '仓储 / 质检 / 售后' },
  { key: '仅退货', title: '仅退货', desc: '只退回实物，不产生退款，重点处理库存和应收调整。', owners: '仓储 / 财务' },
  { key: '维修处理', title: '维修', desc: '派工维修、配件消耗、服务记录和内部回访。', owners: '服务 / 售后' },
  { key: '现场服务', title: '现场服务', desc: '上门排查、调试、培训或回访，不一定产生退换货动作。', owners: '服务 / 客户成功' },
];

export const afterSalesTypeOptions = afterSalesTypeCards.map((item) => item.key);

export const afterSalesHandlingMethods: HandlingMethod[] = ['退款退货', '仅退款', '换货', '仅退货', '维修', '现场服务'];

export const afterSalesTypeHandlingMap: Record<AfterSalesType, HandlingMethod[]> = {
  退款退货: ['退款退货'],
  仅退款: ['仅退款'],
  换货: ['换货'],
  仅退货: ['仅退货'],
  维修处理: ['维修'],
  现场服务: ['现场服务'],
};

export const afterSalesProcessOptions = ['维修处理', '退款退货', '仅退款', '换货', '仅退货', '补发配件', '现场服务'];

export const afterSalesHandlingSettings: Array<{ method: HandlingMethod; name: string; scene: string; linkage: string }> = [
  { method: '退款退货', name: '退货入库 / 财务处理', scene: '退款退货', linkage: '退货入库 + 财务退款 + 应收/发票处理' },
  { method: '换货', name: '退货入库 / 换出出库', scene: '换货', linkage: '退货入库 + 换货出库' },
  { method: '仅退款', name: '仅退款', scene: '仅退款', linkage: '财务退款 + 发票红冲' },
  { method: '仅退货', name: '仅退货', scene: '仅退货', linkage: '退货入库 + 应收调整' },
  { method: '维修', name: '维修', scene: '维修处理', linkage: '服务派工 + 必要配件出库' },
  { method: '现场服务', name: '现场服务', scene: '现场服务', linkage: '现场服务派工 + 必要配件出库' },
];

export const afterSalesDictionary: AfterSalesDictionary = {
  reasons: afterSalesReasonOptions,
  complaints: afterSalesComplaintOptions,
  types: afterSalesTypeOptions,
  handlingMethods: afterSalesHandlingMethods,
};
