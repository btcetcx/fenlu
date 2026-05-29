import type { ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';

export type WarehouseModule =
  | 'stocks'
  | 'inbounds'
  | 'outbounds'
  | 'transfers'
  | 'counts'
  | 'outboundQuality'
  | 'locations';

export interface WarehouseRow extends Record<string, unknown> {
  id: string;
  state?: string;
  tone?: string;
}

export interface WarehouseLine extends Record<string, unknown> {
  id: string;
}

export interface WarehouseDetail extends WarehouseRow {
  lines?: WarehouseLine[];
  attachments?: Array<{ name: string; size: string }>;
  records?: Array<Record<string, unknown>>;
}

export interface WarehouseProduct {
  id: string;
  code: string;
  name: string;
  model: string;
  type: string;
  unit: string;
  batch: string;
  location: string;
  qualityState: string;
  costLayer: string;
  available: number;
  unitCost: string;
}

export interface WarehouseSource {
  id: string;
  type: string;
  code: string;
  title: string;
  object: string;
  date: string;
  lines: WarehouseLine[];
}

export const warehouseProducts: WarehouseProduct[] = [
  { id: 'wp_001', code: 'CP-20250101001', name: 'IPHONE18', model: 'PRO', type: '成品', unit: '台', batch: 'CP20250601', location: 'A区-A01-01', qualityState: '合格', costLayer: 'LAYER-20251221-01', available: 7, unitCost: '3280.00' },
  { id: 'wp_002', code: 'CP-20250101002', name: '半成品物料', model: 'HM-450', type: '半成品', unit: 'KG', batch: 'HM20250601', location: 'B区-B01-01', qualityState: '让步', costLayer: 'LAYER-HM-01', available: 230, unitCost: '100.00' },
  { id: 'wp_003', code: 'YL-20250101003', name: '铝合金型材', model: 'AL-6061', type: '原材料', unit: 'KG', batch: 'AL20250601', location: '冷藏区-L01-01', qualityState: '待检', costLayer: 'LAYER-AL-01', available: 90, unitCost: '18.50' },
  { id: 'wp_004', code: '7820864', name: '半成品物料', model: '规格一', type: '物料', unit: '公斤', batch: 'B20250601', location: 'A区-A01-01', qualityState: '合格', costLayer: 'LAYER-IV-01', available: 60, unitCost: '50.00' },
];

const stockRows: WarehouseDetail[] = [
  { id: 'stock_001', ledgerNo: 'LED-20251221001', code: 'CP-20250101001', image: 'phone', name: 'IPHONE18', model: 'PRO', cat: '成品', unit: '台', stock: 15, workshop: 10, inTransit: 10, frozen: 5, occupied: 3, available: 7, wh: '一号仓库', sourceDoc: 'RK-20251221001', sourceLine: 'RK-20251221001-01', qualityState: '合格', costLayer: 'LAYER-20251221-01', costStatus: '已计价', state: '通过', tone: 'green' },
  { id: 'stock_002', ledgerNo: 'LED-20251221002', code: 'CP-20250101002', image: 'box', name: '半成品物料', model: 'HM-450', cat: '半成品', unit: 'KG', stock: 500, workshop: 20, inTransit: 80, frozen: 0, occupied: 60, available: 440, wh: '二号仓库', sourceDoc: 'MO-20251221001', sourceLine: 'MO-20251221001-02', qualityState: '让步', costLayer: 'LAYER-20251221-02', costStatus: '暂估', state: '待审', tone: 'yellow' },
  { id: 'stock_003', ledgerNo: 'LED-20251221003', code: 'YL-20250101003', image: 'box', name: '铝合金型材', model: 'AL-6061', cat: '原材料', unit: 'KG', stock: 260, workshop: 0, inTransit: 40, frozen: 30, occupied: 20, available: 210, wh: '原料仓', sourceDoc: 'PO-20251221001', sourceLine: 'PO-20251221001-03', qualityState: '待检', costLayer: 'LAYER-20251221-03', costStatus: '未计价', state: '通过', tone: 'green' },
];

const inbounds: WarehouseDetail[] = [
  { id: 'inbound_001', subject: '采购到货入库', code: 'RK-20251221001', type: '采购入库', qty: 1000, applyDate: '2025-12-21', user: '傲为', date: '', state: '已收货待检', tone: 'yellow', owner: '李文涛', target: '华南五金供应商', source: '采购订单' },
  { id: 'inbound_002', subject: '生产完工入库', code: 'RK-20251221002', type: '生产入库', qty: 650, applyDate: '2025-12-20', user: '陈思源', date: '2025-12-21', state: '已上架过账', tone: 'green', owner: '三红', target: '生产一部', source: '生产工单' },
  { id: 'inbound_003', subject: '销售退货入库', code: 'RK-20251221003', type: '退货入库', qty: 120, applyDate: '2025-12-19', user: '王仓', date: '2025-12-20', state: '待上架', tone: 'blue', owner: '赵强', target: '海南微为科技', source: '销售退货' },
  { id: 'inbound_004', subject: '委外完工入库', code: 'RK-20251221004', type: '委外入库', qty: 300, applyDate: '2025-12-18', user: '李库', date: '2025-12-19', state: '质检中', tone: 'yellow', owner: '李文涛', target: '协作加工厂', source: '委外订单' },
  { id: 'inbound_005', subject: '直接入库', code: 'RK-20251221005', type: '直接入库', qty: 80, applyDate: '2025-12-17', user: '王仓', date: '2025-12-17', state: '已入库', tone: 'green', owner: '王仓', target: '行政仓', source: '手工创建' },
];

const outbounds: WarehouseDetail[] = [
  { id: 'outbound_001', subject: '内部领用出库', code: 'CK-20251221001', type: '内部领用', qty: 1000, applyDate: '2025-12-21', user: '傲为', date: '', state: '已审核待占用', tone: 'yellow', owner: '三红', target: '生产一部', destination: '部门领用' },
  { id: 'outbound_002', subject: '委外领料出库', code: 'CK-20251221002', type: '委外领料', qty: 600, applyDate: '2025-12-20', user: '李文涛', date: '2025-12-21', state: '拣货中', tone: 'blue', owner: '李库', target: '协作加工厂', destination: '委外加工' },
  { id: 'outbound_003', subject: '销售订单出库', code: 'CK-20251221003', type: '销售出库', qty: 50, applyDate: '2025-12-19', user: '陈思源', date: '2025-12-20', state: 'OQC待放行', tone: 'yellow', owner: '王仓', target: '海南微为科技', destination: '客户收货' },
  { id: 'outbound_004', subject: '采购退货出库', code: 'CK-20251221004', type: '采购退货', qty: 120, applyDate: '2025-12-18', user: '赵强', date: '', state: '待复核', tone: 'yellow', owner: '王仓', target: '华南五金供应商', destination: '供应商退回' },
  { id: 'outbound_005', subject: '直接出库', code: 'CK-20251221005', type: '直接出库', qty: 20, applyDate: '2025-12-17', user: '王仓', date: '2025-12-17', state: '已过账', tone: 'green', owner: '王仓', target: '行政仓', destination: '其他出库' },
];

const transfers: WarehouseDetail[] = [
  { id: 'transfer_001', subject: '成品仓调拨补货', code: 'DB-20251221001', qty: 120, fromWh: '一号仓库', toWh: '二号仓库', date: '2025-12-21', user: '王仓', state: '调拨出库待确认', tone: 'yellow' },
  { id: 'transfer_002', subject: '原材料跨仓调拨', code: 'DB-20251221002', qty: 260, fromWh: '原料仓', toWh: '生产线边仓', date: '2025-12-20', user: '李库', state: '调入确认中', tone: 'blue' },
  { id: 'transfer_003', subject: '质检暂存释放调拨', code: 'DB-20251221003', qty: 80, fromWh: '质检暂存仓', toWh: '一号仓库', date: '2025-12-19', user: '陈仓', state: '已完成', tone: 'green' },
];

const counts: WarehouseDetail[] = [
  { id: 'count_001', subject: 'A仓季度盘点', code: 'PD-20251221001', wh: 'A仓库', scope: '物品 等5项', lockScope: 'A仓库/A区/指定批次', locked: '是', lockQty: 240, date: '2025-12-21', user: '傲为', state: '未开始', tone: 'gray' },
  { id: 'count_002', subject: '原料仓月度盘点', code: 'PD-20251221002', wh: '原料仓', scope: '全部', lockScope: '原料仓/全部库位', locked: '是', lockQty: 1280, date: '2025-12-20', user: '李文涛', state: '盘点中', tone: 'blue' },
  { id: 'count_003', subject: '生产线边仓抽盘', code: 'PD-20251221003', wh: '生产线边仓', scope: '半成品 12项', lockScope: '不锁库，仅记录差异', locked: '否', lockQty: 0, date: '2025-12-19', user: '陈思源', state: '复盘中', tone: 'yellow' },
  { id: 'count_004', subject: '质检暂存仓复盘', code: 'PD-20251221004', wh: '质检暂存仓', scope: '异常物料', lockScope: '质检暂存仓/待检批次', locked: '是', lockQty: 80, date: '2025-12-18', user: '赵强', state: '差异待调整', tone: 'yellow' },
];

const outboundQuality: WarehouseDetail[] = [
  { id: 'oqc_001', subject: '销售出货质检', code: 'OQC-202605-001', source: 'SO-202605-001 / OUT-202605-009', object: '海南微为科技 / IPHONE18', qty: '50台 / 抽样13台', inspector: '陈质检', date: '2026-05-17', state: '待出货检验', stage: 'OQC', lot: 'SHIP-20260517-09', plan: '出货包装与外观检验 V2.0', sampling: 'AQL 0.65 外观/包装抽样13台', critical: '唛头/序列号/装箱清单', tone: 'yellow' },
  { id: 'oqc_002', subject: '待出货检验示例', code: 'OQC-202605-002', source: 'SO-202605-002 / OUT-202605-010', object: '海南微为科技 / IPHONE18', qty: '30台 / 抽样8台', inspector: '陈质检', date: '2026-05-18', state: '客户验货中', stage: 'OQC', lot: 'SHIP-20260518-10', plan: '出货包装与外观检验 V2.0', sampling: 'AQL 0.65', critical: '装箱清单', tone: 'blue' },
  { id: 'oqc_003', subject: '让步放行示例', code: 'OQC-202605-003', source: 'SO-202605-003 / OUT-202605-011', object: '客户A / 半成品物料', qty: '80KG / 抽样13件', inspector: '王质检', date: '2026-05-18', state: '已放行', stage: 'OQC', lot: 'SHIP-20260518-11', plan: '出货检验方案', sampling: 'AQL 1.0', critical: '客户确认', tone: 'green' },
  { id: 'oqc_004', subject: '拒收重检示例', code: 'OQC-202605-004', source: 'SO-202605-004 / OUT-202605-012', object: '客户B / 铝合金型材', qty: '120KG / 抽样20件', inspector: '李质检', date: '2026-05-19', state: '客户拒收', stage: 'OQC', lot: 'SHIP-20260519-12', plan: '出货检验方案', sampling: '加严抽样', critical: '外观划伤', tone: 'red' },
];

const locations: WarehouseDetail[] = [
  { id: 'location_001', code: 'KW0000001', name: 'A区', desc: '区域描述', capacity: '100m³', warehouse: '仓库A', manager: '王仓', address: '广东省深圳市宝安区一号园区', state: '可用', tone: 'green' },
  { id: 'location_002', code: 'KW0000002', name: 'A-01-01', desc: '成品手机货架', capacity: '80m³', warehouse: '仓库A', manager: '王仓', address: '广东省深圳市宝安区一号园区', state: '可用', tone: 'green' },
  { id: 'location_003', code: 'KW0000003', name: 'B区', desc: '原材料冷藏区', capacity: '120m³', warehouse: '仓库B', manager: '李库', address: '广东省东莞市松山湖二号园区', state: '禁用', tone: 'gray' },
];

const inboundOutboundLines: WarehouseLine[] = warehouseProducts.slice(0, 3).map((item, index) => ({
  id: `line_io_${index + 1}`,
  sourceDoc: index === 0 ? 'PO-20251221001' : 'WO-20251221003',
  sourceLine: `${index === 0 ? 'PO' : 'WO'}-2025122100${index + 1}-01`,
  itemCode: item.code,
  itemName: item.name,
  model: item.model,
  unit: item.unit,
  batch: item.batch,
  shouldQty: index === 0 ? 500 : 120,
  inspectionQty: index === 0 ? 32 : 20,
  qualifiedQty: index === 0 ? 30 : 20,
  concessionQty: index === 0 ? 2 : 0,
  rejectedQty: 0,
  actualQty: index === 0 ? 500 : 120,
  location: item.location,
  qualityNo: index === 0 ? 'IQC-20251221008' : 'FQC-20251221002',
  status: index === 0 ? '待上架' : '已过账',
  qualityState: item.qualityState,
  costLayer: item.costLayer,
  unitCost: item.unitCost,
  amount: Number(item.unitCost) * (index === 0 ? 500 : 120),
  remark: '',
}));

const countLines: WarehouseLine[] = [
  { id: 'count_line_001', sourceLine: 'PD-20251221001-01', itemCode: '7820864', itemName: '半成品物料', model: '规格一', type: '物料', unit: '公斤', batch: 'B20250601', location: 'A区-A01-01', qualityState: '合格', costLayer: 'LAYER-IV-01', lockedQty: 60, bookQty: 60, realQty: 58, recheckQty: 58, diffQty: -2, reason: '仓位错放', dispose: '提交差异审批', adjustNo: 'TZ-20251221001', adjustStatus: '待审批', result: '盘亏', remark: '' },
  { id: 'count_line_002', sourceLine: 'PD-20251221001-02', itemCode: '5786931', itemName: '半成品物料', model: '规格一', type: '物料', unit: '公斤', batch: 'B20250602', location: 'A区-A01-02', qualityState: '合格', costLayer: 'LAYER-IV-02', lockedQty: 60, bookQty: 60, realQty: 60, recheckQty: 60, diffQty: 0, reason: '', dispose: '无需处理', adjustNo: '', adjustStatus: '未生成', result: '正常', remark: '' },
];

const oqcLines: WarehouseLine[] = [
  { id: 'oqc_line_001', item: '瓶身高度检验', method: '仪器测量', valueType: '数值', standard: '200.00mm', upper: '0.40mm', lower: '0.40mm', measured: '200.25', defect: 'MAJOR', result: '合格', image: '上传' },
  { id: 'oqc_line_002', item: '外观划痕', method: '目视检查', valueType: '判定', standard: '无明显划痕', upper: '-', lower: '-', measured: '合格', defect: 'MINOR', result: '合格', image: '上传' },
  { id: 'oqc_line_003', item: '包装完整性', method: '抽样检查', valueType: '判定', standard: '完整', upper: '-', lower: '-', measured: '完整', defect: 'MINOR', result: '合格', image: '上传' },
];

export const warehouseSources: WarehouseSource[] = [
  { id: 'src_in_po', type: '采购订单', code: 'PO-20251221001', title: '采购到货入库来源', object: '华南五金供应商', date: '2025-12-21', lines: inboundOutboundLines },
  { id: 'src_out_so', type: '销售订单', code: 'SO-20251221001', title: '销售订单出库来源', object: '海南微为科技', date: '2025-12-21', lines: inboundOutboundLines },
  { id: 'src_transfer', type: '库存调拨建议', code: 'DB-SRC-20251221001', title: '成品仓调拨补货', object: '一号仓库 -> 二号仓库', date: '2025-12-21', lines: inboundOutboundLines },
];

const mockMap: Record<WarehouseModule, WarehouseDetail[]> = {
  stocks: stockRows,
  inbounds,
  outbounds,
  transfers,
  counts,
  outboundQuality,
  locations,
};

const resourceMap: Record<WarehouseModule, string> = {
  stocks: 'inventory-stocks',
  inbounds: 'warehouse-inbounds',
  outbounds: 'warehouse-outbounds',
  transfers: 'warehouse-transfers',
  counts: 'inventory-counts',
  outboundQuality: 'outbound-quality-inspections',
  locations: 'warehouse-locations',
};

function detailFor(module: WarehouseModule, row: WarehouseDetail): WarehouseDetail {
  if (module === 'stocks') return { ...row, lines: stockDistribution(String(row.code)), records: stockFlowRows(), attachments: defaultAttachments() };
  if (module === 'counts') return { ...row, lines: countLines, attachments: defaultAttachments(), records: defaultRecords('盘点') };
  if (module === 'outboundQuality') return { ...row, lines: oqcLines, attachments: defaultAttachments(), records: defaultRecords('质检') };
  if (module === 'locations') return { ...row, lines: locationCodeRows(), records: defaultRecords('库位') };
  return { ...row, lines: inboundOutboundLines, attachments: defaultAttachments(), records: defaultRecords(String(row.type || row.subject || '仓储')) };
}

function stockDistribution(code: string): WarehouseLine[] {
  const rows: Record<string, WarehouseLine[]> = {
    'CP-20250101001': [
      { id: 'dist_001', warehouse: '一号仓库', area: 'A区', location: 'A-01-01', locationCode: 'KW0000002', batch: 'CP20250601', sourceLine: 'RK-20251221001-01', qualityState: '合格', costLayer: 'LAYER-20251221-01', unitCost: '3280.00', stock: 6, frozen: 2, occupied: 1, available: 3, inTransit: 3, manager: '王仓', status: '可用' },
      { id: 'dist_002', warehouse: '一号仓库', area: 'A区', location: 'A-01-02', locationCode: 'KW0000004', batch: 'CP20250602', sourceLine: 'RK-20251221001-02', qualityState: '合格', costLayer: 'LAYER-20251221-02', unitCost: '3295.00', stock: 4, frozen: 1, occupied: 1, available: 2, inTransit: 2, manager: '王仓', status: '可用' },
      { id: 'dist_003', warehouse: '二号仓库', area: 'B区', location: 'B-02-01', locationCode: 'KW0000006', batch: 'CP20250603', sourceLine: 'DB-20251221002-01', qualityState: '待检', costLayer: 'LAYER-20251221-03', unitCost: '3310.00', stock: 5, frozen: 2, occupied: 1, available: 2, inTransit: 5, manager: '李库', status: '待复核' },
    ],
  };
  return rows[code] || [
    { id: 'dist_default_001', warehouse: '二号仓库', area: 'B区', location: 'B-01-01', locationCode: 'KW0000011', batch: 'HM20250601', sourceLine: 'MO-20251221001-01', qualityState: '合格', costLayer: 'LAYER-HM-01', unitCost: '100.00', stock: 260, frozen: 0, occupied: 30, available: 230, inTransit: 40, manager: '李库', status: '可用' },
  ];
}

function stockFlowRows(): WarehouseLine[] {
  return [
    { id: 'flow_001', sourceDoc: 'RK-20251221001', sourceLine: 'RK-20251221001-01', businessType: '采购入库', direction: '入库', batch: 'B20250601', location: 'A区-A01-01', qualityState: '合格', costLayer: 'LAYER-20251221-01', unitCost: '3280.00', beforeQty: 0, changeQty: 15, afterQty: 15, state: '已过账' },
    { id: 'flow_002', sourceDoc: 'CK-20251221003', sourceLine: 'SO-20251221001-01', businessType: '销售出库', direction: '出库', batch: 'B20250601', location: 'A区-A01-01', qualityState: '合格', costLayer: 'LAYER-20251221-01', unitCost: '3280.00', beforeQty: 15, changeQty: -5, afterQty: 10, state: '已过账' },
  ];
}

function locationCodeRows(): WarehouseLine[] {
  return [
    { id: 'code_001', main: 'SN-202605-0001', parent: 'BOX-202605-010', type: '内部主码', batch: 'B20250601', location: 'A区-A01-01', quality: '合格', stockState: '在库', source: 'RK-20251221001', latest: '库存上架', time: '2026-05-21 10:18' },
    { id: 'code_002', main: 'SN-202605-0002', parent: 'BOX-202605-010', type: '客户码', batch: 'B20250601', location: 'A区-A01-01', quality: '合格', stockState: '占用', source: 'RK-20251221001', latest: 'SO-20251221001', time: '2026-05-21 11:04' },
  ];
}

function defaultRecords(action: string) {
  return [
    { id: 'record_001', time: '2026-05-17 10:25', user: '系统', action: '创建', note: `创建${action}单据` },
    { id: 'record_002', time: '2026-05-17 15:30', user: '仓库管理员', action: '更新', note: '同步来源单据与库存状态' },
  ];
}

function defaultAttachments() {
  return [
    { name: '新建文本文档.PDF', size: '0 Bytes' },
    { name: '质检记录.xlsx', size: '12 KB' },
  ];
}

function toPageResult<T extends WarehouseRow>(items: T[], query: ListQuery = {}): PageResult<T> {
  const pageNo = query.pageNo ?? 1;
  const pageSize = query.pageSize ?? 20;
  const keyword = query.keyword?.trim().toLowerCase();
  const filtered = keyword ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword)) : items;
  const start = (pageNo - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    page: { pageNo, pageSize, total: filtered.length, pages: Math.max(1, Math.ceil(filtered.length / pageSize)) },
  };
}

export function listWarehouse(module: WarehouseModule, query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap[module], query));
  return request<PageResult<WarehouseRow>>({ url: `/${resourceMap[module]}`, method: 'GET', params: query });
}

export function getWarehouseDetail(module: WarehouseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') {
    const row = mockMap[module].find((item) => item.id === id) || mockMap[module][0];
    return Promise.resolve(detailFor(module, row));
  }
  return request<WarehouseDetail>({ url: `/${resource}/${id}`, method: 'GET' });
}

export function createWarehouse(module: WarehouseModule, data: Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ ...data, id: `${module}_${Date.now()}`, state: '已保存' });
  return request<Record<string, unknown>>({ url: `/${resource}`, method: 'POST', data });
}

export function updateWarehouse(module: WarehouseModule, id: string, data: Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ ...data, id });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}`, method: 'PATCH', data });
}

export function approveWarehouse(module: WarehouseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'approve', status: 'approved' });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/approve`, method: 'POST' });
}

export function printWarehouse(module: WarehouseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'print', fileName: `${resource}-${id}.pdf` });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/print`, method: 'POST' });
}

export function exportWarehouse(module: WarehouseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'export', fileName: `${resource}-${id}.xlsx` });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/export`, method: 'POST' });
}
