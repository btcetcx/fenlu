import type { ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';

export type PurchaseModule = 'suppliers' | 'requests' | 'inquiries' | 'orders';

export interface PurchaseRow extends Record<string, unknown> {
  id: string;
  state?: string;
  tone?: string;
}

export interface PurchaseProduct extends Record<string, unknown> {
  id: string;
  productNo: string;
  productName: string;
  model: string;
  categoryName: string;
  unit: string;
  supplier?: string;
  price?: number;
  stock?: number;
  arrival?: string;
}

export interface PurchaseSource extends Record<string, unknown> {
  id: string;
  type: string;
  code: string;
  title: string;
  supplier?: string;
  date: string;
  products: PurchaseProduct[];
}

const suppliers: PurchaseRow[] = [
  { id: 'supplier_001', code: 'SUP-2025-001', name: '深圳鑫达电子科技有限公司', type: '原材料供应商', category: '电子元器件', contact: '张伟', phone: '13800138001', state: '已审核', tone: 'green', source: '供应商建档', date: '2025-12-01' },
  { id: 'supplier_002', code: 'SUP-2025-002', name: '广州宏业机械配件有限公司', type: '零部件供应商', category: '机械零件', contact: '李明', phone: '13900139002', state: '已审核', tone: 'green', source: '供应商建档', date: '2025-11-20' },
  { id: 'supplier_003', code: 'SUP-2025-003', name: '东莞华美包装制品厂', type: '包装供应商', category: '纸箱类', contact: '王芳', phone: '13700137003', state: '待审核', tone: 'yellow', source: '供应商建档', date: '2025-12-10' },
  { id: 'supplier_004', code: 'SUP-2025-004', name: '上海博源化工有限公司', type: '原材料供应商', category: '化工材料', contact: '赵强', phone: '13600136004', state: '已审核', tone: 'green', source: '供应商建档', date: '2025-10-15' },
  { id: 'supplier_005', code: 'TMP-2025-001', name: '宁波临采五金贸易部', type: '临时供应商', category: '询价新增', contact: '孙敏', phone: '13988880001', state: '临时', tone: 'blue', source: '询价单 XJ-202512-003', date: '2025-12-13' },
  { id: 'supplier_006', code: 'TMP-2025-002', name: '青岛海工包装材料商行', type: '临时供应商', category: '待转正', contact: '唐洁', phone: '13988880002', state: '临时', tone: 'blue', source: '询价单 XJ-202512-004', date: '2025-12-14' },
  { id: 'supplier_007', code: 'SUP-2025-005', name: '北京中科检测技术有限公司', type: '服务供应商', category: '检测服务', contact: '陈丽', phone: '13500135005', state: '已停用', tone: 'gray', source: '供应商建档', date: '2025-08-22' },
  { id: 'supplier_008', code: 'SUP-2025-006', name: '佛山顺德精密五金厂', type: '零部件供应商', category: '机械零件', contact: '刘洋', phone: '13400134006', state: '已审核', tone: 'green', source: '供应商建档', date: '2025-12-05' },
  { id: 'supplier_009', code: 'SUP-2025-007', name: '杭州云仓物流有限公司', type: '服务供应商', category: '物流服务', contact: '周杰', phone: '13300133007', state: '待审核', tone: 'yellow', source: '供应商建档', date: '2025-12-12' },
  { id: 'supplier_010', code: 'SUP-2025-008', name: '苏州工业园区塑胶科技', type: '包装供应商', category: '塑料类', contact: '吴敏', phone: '13200132008', state: '已审核', tone: 'green', source: '供应商建档', date: '2025-09-18' },
];

const requests: PurchaseRow[] = [
  { id: 'pr_001', topic: '20240请购购物料00232', code: 'PR-2026-00232', ref: '项目一', source: '项目请购', starter: '张四', phone: '13800138001', date: '2026-06-07', printState: '已打印', state: '已转采购', tone: 'green' },
  { id: 'pr_002', topic: '电气元件补料申请', code: 'PR-2026-00231', ref: 'WO-260607-015', source: '生产缺料', starter: '李文涛', phone: '13900139002', date: '2026-06-06', printState: '未打印', state: '审批中', tone: 'blue' },
  { id: 'pr_003', topic: '研发样机试制材料', code: 'PR-2026-00230', ref: 'PRJ-2026-017', source: '研发项目', starter: '陈思源', phone: '13700137003', date: '2026-06-05', printState: '未打印', state: '待提交', tone: 'yellow' },
  { id: 'pr_004', topic: '包装材料月度请购', code: 'PR-2026-00229', ref: 'PLAN-2026-06', source: '库存补货', starter: '赵强', phone: '13600136004', date: '2026-06-04', printState: '未打印', state: '已完成', tone: 'green' },
  { id: 'pr_005', topic: '铝合金型材比价请购', code: 'PR-2026-00228', ref: 'PROD-PLAN-06', source: '生产缺料', starter: '王敏', phone: '13500135008', date: '2026-06-03', printState: '未打印', state: '待询价', tone: 'yellow' },
  { id: 'pr_006', topic: '精密轴承补充采购', code: 'PR-2026-00227', ref: 'MRP-202606-009', source: 'MRP建议', starter: '系统', phone: '-', date: '2026-06-02', printState: '未打印', state: '已转询价', tone: 'blue' },
];

const inquiries: PurchaseRow[] = [
  { id: 'inq_001', topic: '半成品物料询价', code: 'DD-2024-001', product: '半成品物料', qty: 8, date: '2025-12-12', deadline: '2025-12-12', state: '询价中', tone: 'blue' },
  { id: 'inq_002', topic: '铝合金型材询价', code: 'DD-2024-002', product: '铝合金型材', qty: 12, date: '2025-12-10', deadline: '2025-12-15', state: '询价完毕', tone: 'green' },
  { id: 'inq_003', topic: '精密轴承询价', code: 'DD-2024-003', product: '精密轴承', qty: 30, date: '2025-12-09', deadline: '2025-12-14', state: '待定价', tone: 'yellow' },
  { id: 'inq_004', topic: '包装材料询价', code: 'DD-2024-004', product: '外箱包装', qty: 100, date: '2025-12-08', deadline: '2025-12-13', state: '已定价', tone: 'green' },
  { id: 'inq_005', topic: '化工辅料询价', code: 'DD-2024-005', product: '清洗剂', qty: 20, date: '2025-12-06', deadline: '2025-12-11', state: '作废', tone: 'gray' },
];

const orders: PurchaseRow[] = [
  { id: 'po_001', code: 'CG-20251221001', supplier: '海南傲为', summary: '8(预览浮层)', date: '2025-12-12', amount: 'RMB5960.00', paid: '5960.00', invoice: '5960.00', match: '已匹配', provisional: '0.00', certified: '已认证', deduction: '0.00', payable: '0.00', arrival: '2025-12-31', state: '审核中', tone: 'blue' },
  { id: 'po_002', code: 'CG-20251221002', supplier: '深圳鑫达电子科技有限公司', summary: '5(预览浮层)', date: '2025-12-13', amount: 'RMB12800.00', paid: '0.00', invoice: '0.00', match: '待收货', provisional: '6400.00', certified: '未到票', deduction: '0.00', payable: '6400.00', arrival: '2026-01-05', state: '采购中', tone: 'yellow' },
  { id: 'po_003', code: 'CG-20251221003', supplier: '广州宏业机械配件有限公司', summary: '3(预览浮层)', date: '2025-12-14', amount: 'RMB6800.00', paid: '3000.00', invoice: '3000.00', match: '差异待审', provisional: '3800.00', certified: '待认证', deduction: '200.00', payable: '3600.00', arrival: '2026-01-08', state: '运输中', tone: 'blue' },
  { id: 'po_004', code: 'CG-20251221004', supplier: '佛山启明金属材料有限公司', summary: '2(预览浮层)', date: '2025-12-15', amount: 'RMB980.40', paid: '0.00', invoice: '0.00', match: '待入库', provisional: '0.00', certified: '未到票', deduction: '0.00', payable: '0.00', arrival: '2026-01-10', state: '待入库', tone: 'yellow' },
  { id: 'po_005', code: 'CG-20251221005', supplier: '东莞嘉盛工业材料有限公司', summary: '6(预览浮层)', date: '2025-12-16', amount: 'RMB1035.96', paid: '1035.96', invoice: '1035.96', match: '已关闭', provisional: '0.00', certified: '已认证', deduction: '0.00', payable: '0.00', arrival: '2026-01-12', state: '异常取消', tone: 'gray' },
  { id: 'po_006', code: 'CG-20251221006', supplier: '东莞华美包装制品厂', summary: '4(预览浮层)', date: '2025-12-17', amount: 'RMB4200.00', paid: '2100.00', invoice: '2100.00', match: '部分匹配', provisional: '2100.00', certified: '已认证', deduction: '300.00', payable: '1800.00', arrival: '2026-01-16', state: '部分入库', tone: 'blue' },
  { id: 'po_007', code: 'CG-20251221007', supplier: '上海博源化工有限公司', summary: '7(预览浮层)', date: '2025-12-18', amount: 'RMB7600.00', paid: '7600.00', invoice: '7600.00', match: '已匹配', provisional: '0.00', certified: '已认证', deduction: '0.00', payable: '0.00', arrival: '2026-01-20', state: '已完成', tone: 'green' },
];

export const purchaseProducts: PurchaseProduct[] = [
  { id: 'p1', productNo: '7820864', productName: '半成品物料', model: 'HM-450', categoryName: '半成品', unit: 'KG', supplier: '深圳鑫达电子科技有限公司', price: 50, stock: 1200, arrival: '2025-12-20' },
  { id: 'p2', productNo: '5786931', productName: '半成品物料', model: 'HM-451', categoryName: '半成品', unit: 'KG', supplier: '广州宏业机械配件有限公司', price: 48, stock: 860, arrival: '2025-12-22' },
  { id: 'p3', productNo: '8518691', productName: '铝合金型材', model: 'AL-6061', categoryName: '原材料', unit: 'KG', supplier: '上海博源化工有限公司', price: 32, stock: 520, arrival: '2025-12-25' },
  { id: 'p4', productNo: '6576642', productName: '精密轴承', model: 'BR-6205', categoryName: '零部件', unit: '个', supplier: '佛山顺德精密五金厂', price: 18, stock: 240, arrival: '2025-12-26' },
  { id: 'p5', productNo: '6081578', productName: '外箱包装', model: 'PK-500', categoryName: '包装材料', unit: '个', supplier: '东莞华美包装制品厂', price: 4.5, stock: 1800, arrival: '2025-12-28' },
];

export const purchaseSuppliers = [
  { id: 's1', name: '海南傲为', level: 'A', contact: '夏经理', phone: '13800138000' },
  { id: 's2', name: '深圳鑫达电子科技有限公司', level: 'A', contact: '丁昌容', phone: '13500001111' },
  { id: 's3', name: '广州宏业机械配件有限公司', level: 'B', contact: '纪广', phone: '13500002222' },
  { id: 's4', name: '佛山启明金属材料有限公司', level: 'A', contact: '庞慧', phone: '13500003333' },
  { id: 's5', name: '东莞嘉盛工业材料有限公司', level: 'B', contact: '顾伦', phone: '13500004444' },
];

export const inquirySources: PurchaseSource[] = [
  { id: 'src-pr-1', type: '请购明细', code: 'PR-2026-00232', title: '20240请购购物料00232', date: '2026-06-07', products: [{ ...purchaseProducts[0], qty: 8 }, { ...purchaseProducts[2], qty: 12 }] },
  { id: 'src-plan-1', type: '采购计划', code: 'PLAN-2026-06-01', title: '六月原材料询价计划', date: '2026-06-01', products: [{ ...purchaseProducts[3], qty: 30 }, { ...purchaseProducts[4], qty: 100 }] },
  { id: 'src-stock-1', type: '库存补货', code: 'STOCK-LOW-202606', title: '低库存物料补货询价', date: '2026-06-03', products: [{ ...purchaseProducts[2], id: 'cl1', productNo: 'CL-2026-001', productName: '清洗剂', model: '25L', categoryName: '化工辅料', unit: '桶', qty: 20, price: 72, supplier: '上海博源化工有限公司' }] },
];

export const orderSources: PurchaseSource[] = [
  { id: 'pr-1', type: '请购', title: '20240请购购物料00232', code: 'PR-2026-00232', supplier: '海南傲为', date: '2026-06-07', products: [
    { ...purchaseProducts[0], id: 'pr-p1', sourceLine: 'PR-2026-00232-01', priceSource: '请购转采购/待询价', qty: 500, waitPurchaseQty: 250, amount: 25000, supplier: '海南傲为', arrival: '2025-12-31' },
    { ...purchaseProducts[1], id: 'pr-p2', sourceLine: 'PR-2026-00232-02', priceSource: '请购转采购/待询价', qty: 500, waitPurchaseQty: 500, amount: 25000, supplier: '海南傲为', arrival: '2025-12-31' },
  ] },
  { id: 'inq-1', type: '询价', title: '铝合金型材询价', code: 'DD-2024-002', supplier: '佛山启明金属材料有限公司', date: '2025-12-10', products: [
    { ...purchaseProducts[2], id: 'inq-p1', sourceLine: 'IQ-20251219001-01', priceSource: '询价定价/佛山启明/V2', qty: 12, waitPurchaseQty: 12, price: 86, amount: 980.4, supplier: '佛山启明金属材料有限公司', arrival: '2025-12-18' },
    { ...purchaseProducts[0], id: 'inq-p2', sourceLine: 'IQ-20251219001-02', priceSource: '询价定价/深圳鑫达/V1', qty: 8, waitPurchaseQty: 8, price: 50, amount: 392, supplier: '深圳鑫达电子科技有限公司', arrival: '2025-12-20' },
  ] },
  { id: 'mrp-1', type: 'MRP采购建议', title: '6月温控终端缺料采购建议', code: 'MRP-PUR-202606-001', supplier: '深圳鑫达电子科技有限公司', date: '2026-06-08', products: [
    { id: 'mrp-p1', productNo: 'ECU-2601', productName: '电子控制板', model: 'ECU-A1', categoryName: '电子元器件', unit: 'PCS', sourceLine: 'MRP-PUR-202606-001-01', priceSource: 'MRP采购建议/供应商报价', qty: 120, waitPurchaseQty: 120, price: 86, amount: 10320, supplier: '深圳鑫达电子科技有限公司', arrival: '2026-06-15' },
  ] },
];

const mockMap: Record<PurchaseModule, PurchaseRow[]> = { suppliers, requests, inquiries, orders };
const resourceMap: Record<PurchaseModule, string> = {
  suppliers: 'suppliers',
  requests: 'purchase-requests',
  inquiries: 'purchase-inquiries',
  orders: 'purchase-orders',
};

function toPageResult<T extends PurchaseRow>(items: T[], query: ListQuery = {}): PageResult<T> {
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

export function listPurchase(module: PurchaseModule, query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap[module], query));
  return request<PageResult<PurchaseRow>>({ url: `/${resourceMap[module]}`, method: 'GET', params: query });
}

export function createPurchase(module: PurchaseModule, data: Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ ...data, id: `${module}_${Date.now()}` });
  return request<Record<string, unknown>>({ url: `/${resource}`, method: 'POST', data });
}

export function getPurchaseDetail(module: PurchaseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve(mockMap[module].find((item) => item.id === id) || mockMap[module][0]);
  return request<PurchaseRow>({ url: `/${resource}/${id}`, method: 'GET' });
}

export function updatePurchase(module: PurchaseModule, id: string, data: Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ ...data, id });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}`, method: 'PATCH', data });
}

export function approvePurchase(module: PurchaseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'approve', status: 'approved' });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/approve`, method: 'POST' });
}

export function printPurchase(module: PurchaseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'print', fileName: `${resource}-${id}.pdf` });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/print`, method: 'POST' });
}

export function exportPurchase(module: PurchaseModule, id: string, mode: 'mock' | 'remote' = 'mock') {
  const resource = resourceMap[module];
  if (mode === 'mock') return Promise.resolve({ id, action: 'export', fileName: `${resource}-${id}.xlsx` });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/export`, method: 'POST' });
}
