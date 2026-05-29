<template>
  <operation-setting-page v-if="settingModule" :module="settingModule" />

  <production-create
    v-else-if="currentView === 'new'"
    :config="config"
    :resource="resource"
    @back="goList"
    @created="handleCreated"
  />

  <production-detail
    v-else-if="currentView === 'detail' && detailId"
    :config="config"
    :resource="resource"
    :id="detailId"
    @back="goList"
  />

  <production-demand-summary-page v-else-if="demandAction === 'summary'" @back="goList" />

  <work-order-dispatch-page v-else-if="workOrderAction === 'dispatch'" @back="goList" />

  <work-order-report-page v-else-if="workOrderAction === 'report'" @back="goList" />

  <work-order-report-record-page v-else-if="workOrderAction === 'records'" @back="goList" />

  <aw-list-page v-else>
    <aw-list-toolbar
      :search-placeholder="`全局搜索（如${config.subjectTitle}、${config.codeTitle}、产品名称...）`"
      :create-label="config.createLabel"
      :actions="toolbarActions"
      @search="keyword = $event"
      @refresh="loadData"
      @filter="message = '筛选抽屉沿用列表母版，当前按状态列筛选'"
      @columns="message = '字段配置入口已接入，设置页可维护生产字段'"
      @import="message = '导入动作已触发，等待对接生产导入接口'"
      @export="message = '导出动作已触发，等待对接生产导出接口'"
      @create="openCreate"
    />

    <div v-if="message" class="aw-form-note production-list-message">{{ message }}</div>

    <aw-data-table
      :columns="columns"
      :rows="tableRows"
      :row-key="'id'"
      :total="filteredItems.length"
      :bulk-actions="bulkActions"
      :filter-values="columnFilters"
      :fit-width="columns.length <= 9"
      @selection-change="selectedKeys = $event"
      @batch-action="handleBatchAction"
      @column-filter="handleColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'subject'" class="aw-link" @click="openDetail((record as unknown as ProductionRecord).id)">{{ value }}</span>
        <span v-else-if="column.key === 'progress'">
          <span class="production-progress"><i :style="{ width: `${progress(record as unknown as ProductionRecord)}%` }"></i></span>
          <span class="aw-num">{{ progress(record as unknown as ProductionRecord) }}%</span>
        </span>
        <span v-else-if="column.key === 'statusName'" :class="['aw-status', statusTone(record.status)]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openDetail((record as unknown as ProductionRecord).id)">查看</span>
        <span v-else>{{ formatCell(value, column.numeric) }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, isVNode, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ListQuery } from '@/app/api/shared/types';
import {
  createProduction,
  createWorkOrderClaim,
  createWorkOrderReport,
  exportProduction,
  getWorkOrderDispatchDetail,
  getProductionDetail,
  getWorkOrderReportDetail,
  listProductionDemandSummary,
  listOutsourceSuppliers,
  listProduction,
  listProductionPeople,
  listProductionProducts,
  listProductionSources,
  listWorkOrderAssignedTasks,
  listWorkOrderClaimTasks,
  listWorkOrderReportPeople,
  listWorkOrderReportRecords,
  printProduction,
  runProductionAction,
  updateProduction,
} from '@/app/api/production/resources';
import type {
  OutsourceSupplier,
  ProductionDetail,
  ProductionDetailTable,
  ProductionLine,
  ProductionPickerProduct,
  ProductionRecord,
  ProductionResource,
  ProductionSource,
  ProductionDemandSummaryRow,
  WorkOrderAssignedTask,
  WorkOrderClaimTask,
  WorkOrderReportPeopleGroup,
  WorkOrderReportPerson,
  WorkOrderReportRecord,
} from '@/app/api/production/types';
import type { OperationSettingModule } from '@/app/templates/operation-settings-template';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import type { AwBulkAction, AwTableColumn, ToolbarActionKey } from '@/components/list-page/types';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { EditableColumn, FormAction } from '@/components/form-page/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailFieldItem, DetailTabItem } from '@/components/detail-page/types';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import type { PersonPickerDept, PersonPickerPerson } from '@/components/setting-page/types';
import OperationSettingPage from '@/views/operation/shared/OperationSettingPage.vue';

interface ProductionConfig {
  resource: ProductionResource;
  settingModule: OperationSettingModule;
  title: string;
  createLabel: string;
  subjectTitle: string;
  codeTitle: string;
  quantityTitle: string;
  ownerTitle: string;
  statusTitle: string;
  sourceTypes: string[];
  baseFields: string[];
  lineMode: 'demand' | 'plan' | 'order' | 'work' | 'outsource';
  createSubmitLabel: string;
}

interface ProductionDetailHandlers {
  openGeneratedPlan: (line: ProductionLine) => void;
  openStartOrder: (line?: ProductionLine) => void;
  openOutsourceIssue: () => void;
  outsourceSendRows: string[][];
  openMrp: () => void;
  kitRows: string[][];
  openKitDoc: (row: string[]) => void;
  withdrawKitRow: (index: number) => void;
  openMaterialIssue: (line: ProductionLine) => void;
}

const route = useRoute();
const router = useRouter();
const items = ref<ProductionRecord[]>([]);
const keyword = ref('');
const selectedKeys = ref<string[]>([]);
const columnFilters = ref<Record<string, string>>({});
const message = ref('');
const query: ListQuery = { pageNo: 1, pageSize: 20 };

const configs: Record<ProductionResource, ProductionConfig> = {
  'production-demands': {
    resource: 'production-demands',
    settingModule: 'productionDemands',
    title: '生产需求',
    createLabel: '新增生产需求',
    subjectTitle: '需求主题',
    codeTitle: '需求编号',
    quantityTitle: '需求数量',
    ownerTitle: '责任部门',
    statusTitle: '需求状态',
    sourceTypes: ['销售订单'],
    baseFields: ['source', 'customer', 'department', 'dates', 'priority', 'owner'],
    lineMode: 'demand',
    createSubmitLabel: '提交需求',
  },
  'production-plans': {
    resource: 'production-plans',
    settingModule: 'productionPlans',
    title: '生产计划',
    createLabel: '新增生产计划',
    subjectTitle: '计划主题',
    codeTitle: '计划编号',
    quantityTitle: '计划数量',
    ownerTitle: '责任部门',
    statusTitle: '计划状态',
    sourceTypes: ['生产需求', '销售订单', '库存备货'],
    baseFields: ['source', 'cycle', 'workshop', 'strategy', 'owner'],
    lineMode: 'plan',
    createSubmitLabel: '提交计划',
  },
  'production-orders': {
    resource: 'production-orders',
    settingModule: 'productionOrders',
    title: '生产订单',
    createLabel: '新增生产订单',
    subjectTitle: '生产主题',
    codeTitle: '生产编号',
    quantityTitle: '计划数量',
    ownerTitle: '责任部门',
    statusTitle: '生产状态',
    sourceTypes: ['生产需求', '生产计划'],
    baseFields: ['source', 'bom', 'workshop', 'dates', 'owner'],
    lineMode: 'order',
    createSubmitLabel: '提交订单',
  },
  'production-work-orders': {
    resource: 'production-work-orders',
    settingModule: 'productionWorkOrders',
    title: '生产工单',
    createLabel: '新增生产工单',
    subjectTitle: '工单主题',
    codeTitle: '工单编号',
    quantityTitle: '计划数量',
    ownerTitle: '负责人',
    statusTitle: '工单状态',
    sourceTypes: ['生产订单'],
    baseFields: ['source', 'process', 'dispatch', 'equipment', 'hours', 'reportMode'],
    lineMode: 'work',
    createSubmitLabel: '提交工单',
  },
  'outsource-orders': {
    resource: 'outsource-orders',
    settingModule: 'outsourceOrders',
    title: '委外加工',
    createLabel: '新增委外加工',
    subjectTitle: '委外主题',
    codeTitle: '委外编号',
    quantityTitle: '计划数量',
    ownerTitle: '加工商',
    statusTitle: '委外状态',
    sourceTypes: ['生产订单', '生产工单'],
    baseFields: ['source', 'supplier', 'pricing', 'delivery', 'quality'],
    lineMode: 'outsource',
    createSubmitLabel: '提交委外',
  },
};

const resource = computed<ProductionResource>(() => {
  if (route.path.includes('production-plans')) return 'production-plans';
  if (route.path.includes('production-orders')) return 'production-orders';
  if (route.path.includes('production-work-orders')) return 'production-work-orders';
  if (route.path.includes('outsource-orders')) return 'outsource-orders';
  return 'production-demands';
});
const config = computed(() => configs[resource.value]);
const settingModule = computed(() => (route.query.setting ? config.value.settingModule : null));
const detailId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''));
const currentView = computed(() => {
  if (route.query.action === 'new') return 'new';
  if (detailId.value) return 'detail';
  return 'list';
});
const demandAction = computed(() => {
  if (resource.value !== 'production-demands') return '';
  const action = typeof route.query.action === 'string' ? route.query.action : '';
  if (action === '生产需求汇总') return 'summary';
  return '';
});
const workOrderAction = computed(() => {
  if (resource.value !== 'production-work-orders') return '';
  const action = typeof route.query.action === 'string' ? route.query.action : '';
  if (action === '领工派工') return 'dispatch';
  if (action === '任务报工') return 'report';
  if (action === '报工记录') return 'records';
  return '';
});

const toolbarActions: ToolbarActionKey[] = ['refresh', 'filter', 'columns', 'import', 'export', 'create'];
const bulkActions: AwBulkAction[] = [
  { key: 'bulk', label: '批量操作' },
];

const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const keywordMatched =
      !term ||
      [item.subject, item.code, item.sourceCode, item.sourceName, item.customerName, item.productName, item.ownerName, item.statusName].some((value) => value?.includes(term));
    const statusMatched = !columnFilters.value.statusName || item.statusName === columnFilters.value.statusName;
    return keywordMatched && statusMatched;
  });
});
const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, progress: progress(item), action: '查看' })));
const columns = computed<AwTableColumn[]>(() => {
  const base: AwTableColumn[] = [
    { key: 'subject', title: config.value.subjectTitle, width: 190 },
    { key: 'code', title: config.value.codeTitle, width: 150 },
    { key: 'sourceCode', title: '来源单据', width: 150 },
    { key: 'productName', title: '产品概要', width: 150 },
    { key: 'quantity', title: config.value.quantityTitle, numeric: true, width: 110 },
  ];
  if (resource.value === 'production-plans') base.push({ key: 'progress', title: '进度', width: 140 });
  base.push(
    { key: 'startDate', title: '开始日期', width: 120 },
    { key: 'endDate', title: '交付日期', width: 120 },
  );
  if (resource.value === 'production-work-orders') {
    base.push({ key: 'workshopName', title: '工厂车间', width: 140 }, { key: 'lineName', title: '产线', width: 130 });
  }
  if (resource.value === 'outsource-orders') base.push({ key: 'supplierName', title: '加工商', width: 170 });
  else base.push({ key: 'ownerName', title: config.value.ownerTitle, width: 130 });
  base.push(
    { key: 'statusName', title: config.value.statusTitle, width: 130, filterOptions: Array.from(new Set(items.value.map((item) => item.statusName))) },
    { key: 'action', title: '操作', width: 90, fixed: 'right' },
  );
  return base;
});

watch(resource, () => {
  columnFilters.value = {};
  message.value = '';
  void loadData();
});

onMounted(loadData);

async function loadData() {
  const result = await listProduction(resource.value, query);
  items.value = result.items;
}

function openCreate() {
  router.push({ path: route.path, query: { action: 'new' } });
}

function openDetail(id: string) {
  router.push({ path: route.path, query: { id } });
}

function goList() {
  router.push(route.path);
}

function handleCreated(text: string) {
  message.value = text;
  void loadData();
  goList();
}

function handleColumnFilter(columnKey: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [columnKey]: value };
}

function handleBatchAction(actionKey: string, keys: string[]) {
  selectedKeys.value = keys;
  message.value = `${actionKey === 'bulk' ? '批量操作' : actionKey}已触发，选中 ${keys.length} 条`;
}

function progress(row: ProductionRecord) {
  return Math.max(0, Math.min(100, Math.round((Number(row.doneQuantity || 0) / Math.max(Number(row.quantity || 0), 1)) * 100)));
}

function statusTone(status: unknown) {
  const text = String(status || '');
  if (['approved', 'confirmed', 'completed', 'reported', 'received'].some((key) => text.includes(key)) || ['已确认', '已批准', '已完成', '已完工', '齐套', '已入库', '已发料', '已质检'].includes(text)) return 'green';
  if (['pending', 'draft', 'processing', 'producing', 'warning'].some((key) => text.includes(key)) || ['待确认', '待审批', '待生产', '待开工', '待发料', '待收货', '待报工', '部分缺料', '加工中', '生产中'].includes(text)) return 'yellow';
  if (['delayed', 'rework', 'closed', '缺料'].some((key) => text.includes(key))) return 'red';
  return 'blue';
}

function formatCell(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) return value.toLocaleString('zh-CN');
  return value ?? '-';
}

function lineFromProduct(product: ProductionPickerProduct, options: { seeded?: boolean; sourceType?: string; sourceCode?: string; sourceLine?: string } = {}): ProductionLine {
  const quantity = options.seeded ? Number(product.quantity || 120) : '';
  const sourceCode = options.sourceCode || (options.seeded ? product.sourceLine || '手动创建' : '手动创建');
  const sourceLine = options.sourceLine || (options.seeded ? product.sourceLine || '手动' : '手动');
  return {
    id: `line_${Date.now()}_${product.id}`,
    sourceType: options.sourceType || '手动需求',
    sourceCode,
    sourceLine,
    productCode: product.productCode,
    productName: product.productName,
    model: product.model,
    unit: product.unit,
    quantity,
    demandQuantity: quantity,
    planQuantity: quantity,
    requestDate: '',
    startDate: product.startDate || '',
    endDate: product.endDate || product.deliveryDate || '',
    bomVersion: product.bomVersion,
    bomLock: product.bomLock || '待锁版',
    routeCode: product.routeCode,
    routeLock: product.routeLock || '待锁版',
    processName: product.processName,
    stationName: product.processName === '焊接' ? '焊接产线A' : '总装产线A',
    ownerName: '',
    qmsStatus: product.qmsStatus || (product.processName === '总装' ? 'FQC待检' : 'IPQC巡检'),
    completedQuantity: product.reportedQuantity || (product as any).completedQuantity || 0,
    goodQuantity: product.goodQuantity || 0,
    badQuantity: product.badQuantity || 0,
    inboundQuantity: product.inboundQuantity || 0,
    statusName: Number(product.reportedQuantity || (product as any).completedQuantity || product.inboundQuantity || 0) > 0 ? '生产中' : '待开工',
    sourceQuantity: quantity,
    outsourceQuantity: quantity,
    price: product.price,
    amount: product.price * Number(quantity || 0),
    cost: '',
    deliveryDate: product.deliveryDate || product.endDate || '',
    remark: '',
  };
}

function createLineColumns(mode: ProductionConfig['lineMode']): EditableColumn[] {
  const common: EditableColumn[] = [
    { key: 'sourceType', title: '来源类型', width: 110 },
    { key: 'sourceCode', title: '来源单据', width: 150 },
    { key: 'sourceLine', title: '来源明细', width: 150 },
    { key: 'productCode', title: '产品编号', width: 130 },
    { key: 'productName', title: '产品名称', width: 150 },
    { key: 'model', title: '规格型号', width: 110 },
    { key: 'unit', title: '单位', width: 80 },
  ];
  if (mode === 'demand') {
    return [
      ...common,
      { key: 'demandQuantity', title: '需求数量', width: 110 },
      { key: 'requestDate', title: '需求日期', width: 120 },
      { key: 'deliveryDate', title: '交付日期', width: 120 },
      { key: 'remark', title: '备注', width: 160 },
    ];
  }
  if (mode === 'plan') {
    return [
      ...common,
      { key: 'demandQuantity', title: '需求数量', width: 110 },
      { key: 'planQuantity', title: '计划数量', width: 110 },
      { key: 'startDate', title: '计划开工', width: 120 },
      { key: 'endDate', title: '计划完工', width: 120 },
      { key: 'remark', title: '备注', width: 160 },
    ];
  }
  if (mode === 'order') {
    return [
      { key: 'workCode', title: '工单编号', width: 160 },
      { key: 'workType', title: '工单类型', width: 130 },
      { key: 'workName', title: '工单名称', width: 170 },
      { key: 'itemName', title: '半成品/成品', width: 150 },
      { key: 'processName', title: '工序', width: 110 },
      { key: 'stationName', title: '工位/产线', width: 130 },
      { key: 'quantity', title: '计划数量', width: 110 },
      { key: 'completedQuantity', title: '已完成', width: 90 },
      { key: 'goodQuantity', title: '合格', width: 90 },
      { key: 'badQuantity', title: '不良', width: 90 },
      { key: 'ownerName', title: '负责人', width: 110 },
      { key: 'qmsStatus', title: '质检节点', width: 120 },
      { key: 'statusName', title: '状态', width: 100 },
    ];
  }
  if (mode === 'work') {
    return [
      { key: 'processSeq', title: '工序号', width: 90 },
      { key: 'processName', title: '工序名称', width: 130 },
      { key: 'processType', title: '工序类型', width: 120 },
      { key: 'stationName', title: '工位/产线', width: 130 },
      { key: 'planQuantity', title: '计划数量', width: 110 },
      { key: 'standard', title: '作业标准', width: 180 },
      { key: 'startDate', title: '计划开工', width: 120 },
      { key: 'endDate', title: '计划完工', width: 120 },
      { key: 'dispatchMode', title: '操作', width: 150 },
    ];
  }
  if (mode === 'outsource') {
    return [];
  }
  return common;
}

function createOutsourceColumns(scope: string): EditableColumn[] {
  const processScope = scope === '工序委外';
  return processScope
    ? [
        { key: 'sourceCode', title: '来源单据', width: 150 },
        { key: 'processSeq', title: '工序编号', width: 110 },
        { key: 'processName', title: '工序名称', width: 130 },
        { key: 'processType', title: '工序类型', width: 120 },
        { key: 'stationName', title: '工位/产线', width: 130 },
        { key: 'bomVersion', title: 'BOM版本', width: 120 },
        { key: 'bomLock', title: 'BOM锁版', width: 110 },
        { key: 'routeCode', title: '工艺路线', width: 140 },
        { key: 'routeLock', title: '工艺锁版', width: 110 },
        { key: 'sourceQuantity', title: '源单需求数量', width: 120 },
        { key: 'outsourceQuantity', title: '委外数量', width: 110 },
        { key: 'unit', title: '单位', width: 80 },
        { key: 'cost', title: '成本费用', width: 110 },
        { key: 'deliveryDate', title: '计划交付', width: 120 },
        { key: 'remark', title: '备注', width: 160 },
      ]
    : [
        { key: 'sourceCode', title: '来源单据', width: 150 },
        { key: 'productCode', title: '产品编号', width: 130 },
        { key: 'productName', title: '产品名称', width: 150 },
        { key: 'model', title: '规格型号', width: 110 },
        { key: 'bomVersion', title: 'BOM版本', width: 120 },
        { key: 'bomLock', title: 'BOM锁版', width: 110 },
        { key: 'routeCode', title: '工艺路线', width: 140 },
        { key: 'routeLock', title: '工艺锁版', width: 110 },
        { key: 'sourceQuantity', title: '源单需求数量', width: 120 },
        { key: 'outsourceQuantity', title: '委外数量', width: 110 },
        { key: 'unit', title: '单位', width: 80 },
        { key: 'cost', title: '成本费用', width: 110 },
        { key: 'deliveryDate', title: '计划交付', width: 120 },
        { key: 'remark', title: '备注', width: 160 },
      ];
}

function createProcessRows(product?: ProductionLine | ProductionPickerProduct): ProductionLine[] {
  if (!product) return [];
  const productCode = product.productCode;
  const productName = product.productName;
  const quantity = Number((product as ProductionLine).quantity || 120);
  const base = [
    { id: 'step1', processSeq: '10', processName: '备料', processType: '准备工序', stationName: '线边仓', standard: '按BOM齐套领料', startDate: '2026-05-18', endDate: '2026-05-18', ownerName: '张仓', statusName: '待领料' },
    { id: 'step2', processSeq: '20', processName: productCode === 'CP-2025010102' ? '贴片' : productCode === 'CP-2025010103' ? 'CNC加工' : '焊接', processType: '关键工序', stationName: productCode === 'CP-2025010103' ? 'CNC-01' : '焊接工位01', standard: '首件确认后批量加工', startDate: '2026-05-19', endDate: '2026-05-20', ownerName: '李工', statusName: '待开工' },
    { id: 'step3', processSeq: '30', processName: '总装', processType: '总装工序', stationName: '总装线A', standard: '按工艺卡完成装配', startDate: '2026-05-21', endDate: '2026-05-23', ownerName: '三红', statusName: '待开工' },
    { id: 'step4', processSeq: '40', processName: '包装', processType: '包装工序', stationName: '包装区01', standard: '贴标、装箱、入库前确认', startDate: '2026-05-24', endDate: '2026-05-25', ownerName: '王工', statusName: '待开工' },
  ];
  return base.map((step, index) => ({
    ...lineFromProduct(product as ProductionPickerProduct, { seeded: true }),
    id: `${productCode || productName}_${step.id}_${Date.now()}_${index}`,
    productCode: productCode || '',
    productName: productName || '',
    processSeq: step.processSeq,
    processName: step.processName,
    processType: step.processType,
    stationName: step.stationName,
    planQuantity: quantity,
    quantity,
    standard: step.standard,
    startDate: step.startDate,
    endDate: step.endDate,
    ownerName: step.ownerName,
    statusName: step.statusName,
    dispatchMode: index === 0 ? '领工模式' : '派工模式',
  }));
}

function buildWorkOrderLines(product?: ProductionLine): ProductionLine[] {
  if (!product) return [];
  const quantity = Number(product.quantity || product.planQuantity || product.demandQuantity || 0) || 1;
  const prefix = String(product.sourceLine || product.productCode || 'MO-ITEM').replace(/[^A-Z0-9]/g, '').slice(-8) || 'ITEM0001';
  const reported = Number(product.completedQuantity || (product as any).reportedQuantity || 0);
  const good = Number(product.goodQuantity || 0);
  const bad = Number(product.badQuantity || 0);
  const inbound = Number((product as any).inboundQuantity || 0);
  const statusName = reported > 0 || inbound > 0 ? '生产中' : '待开工';
  return [
    { ...product, id: `${product.id}_wo_1`, workCode: `WO-${prefix}-01`, workType: '半成品工单', workName: `${product.productName}半成品制备工单`, itemName: product.productName.includes('半成品') ? product.productName : `${product.productName}半成品`, processName: product.processName === '焊接' ? '焊接' : '备料/预装', stationName: product.processName === '焊接' ? '焊接产线A' : '预装工位01', quantity, completedQuantity: reported, goodQuantity: good, badQuantity: bad, ownerName: '三红', qmsStatus: 'IPQC巡检', statusName },
    { ...product, id: `${product.id}_wo_2`, workCode: `WO-${prefix}-02`, workType: '关键工序工单', workName: `${product.processName || '关键工序'}工单`, itemName: product.productName, processName: product.processName || '关键工序', stationName: '关键工序工位02', quantity, completedQuantity: reported, goodQuantity: good, badQuantity: bad, ownerName: '李工', qmsStatus: 'IPQC巡检', statusName },
    { ...product, id: `${product.id}_wo_3`, workCode: `WO-${prefix}-03`, workType: '成品总装工单', workName: `${product.productName}总装工单`, itemName: product.productName, processName: '总装/包装', stationName: '总装产线A', quantity, completedQuantity: reported || inbound, goodQuantity: good || inbound, badQuantity: bad, ownerName: '王工', qmsStatus: 'FQC完工检', statusName: reported || inbound ? '生产中' : '待开工' },
  ];
}

const ProductionDetail = defineComponent({
  name: 'ProductionDetail',
  props: {
    config: { type: Object as () => ProductionConfig, required: true },
    resource: { type: String as () => ProductionResource, required: true },
    id: { type: String, required: true },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const detail = ref<ProductionDetail | null>(null);
    const activeTab = ref('');
    const editing = ref(false);
    const editText = ref('');
    const actionMessage = ref('');
    const showOutsourceIssue = ref(false);
    const outsourceSendRows = ref<string[][]>([]);
    const flowView = ref<'detail' | 'generated-plan' | 'generated-orders'>('detail');
    const flowLine = ref<ProductionLine | null>(null);
    const generatedProducts = ref<ProductionPickerProduct[]>([]);
    const showStartModal = ref(false);
    const startMode = ref<'plan' | 'order'>('plan');
    const startPlanFlow = ref(false);
    const showMrpModal = ref(false);
    const kitRows = ref<string[][]>([]);
    const kitDocRow = ref<string[] | null>(null);
    const showMaterialIssue = ref(false);
    const materialIssueStep = ref<ProductionLine | null>(null);
    const tabs = computed<DetailTabItem[]>(() => detailTabs(props.resource));
    const actions = computed<DetailAction[]>(() => detailActions(props.resource));

    watch(() => [props.resource, props.id], load, { immediate: true });

    async function load() {
      const [loadedDetail, products] = await Promise.all([
        getProductionDetail(props.resource, props.id),
        listProductionProducts(),
      ]);
      detail.value = loadedDetail;
      generatedProducts.value = products;
      activeTab.value = tabs.value[0]?.key || 'info';
      editText.value = detail.value.detailText || '';
      outsourceSendRows.value = detail.value.detailTables?.outsourceSend?.rows.map((row) => [...row]) || [];
      showOutsourceIssue.value = false;
      flowView.value = 'detail';
      flowLine.value = null;
      showStartModal.value = false;
      startMode.value = 'plan';
      startPlanFlow.value = false;
      showMrpModal.value = false;
      kitRows.value = [];
      kitDocRow.value = null;
      showMaterialIssue.value = false;
      materialIssueStep.value = null;
      editing.value = false;
      actionMessage.value = '';
    }

    async function handleAction(key: string) {
      if (!detail.value) return;
      if (key === 'edit') {
        activeTab.value = tabs.value[0]?.key || 'info';
        editing.value = !editing.value;
        actionMessage.value = editing.value ? '已进入编辑态，可修改详情说明后保存。' : '已退出编辑态。';
        return;
      }
      if (key === 'delete') {
        await runProductionAction(props.resource, detail.value.id, 'delete');
        actionMessage.value = '删除动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'print') {
        await printProduction(props.resource, detail.value.id);
        actionMessage.value = '打印动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'export') {
        await exportProduction(props.resource, detail.value.id);
        actionMessage.value = '导出动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'disable') {
        await runProductionAction(props.resource, detail.value.id, 'disable');
        actionMessage.value = '停用动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'start') {
        openStartFlow('plan');
      }
    }

    async function saveEdit() {
      if (!detail.value) return;
      detail.value = await updateProduction(props.resource, detail.value.id, { detailText: editText.value });
      editing.value = false;
      actionMessage.value = '详情修改已通过 mock 接口保存。';
    }

    async function confirmOutsourceIssue(payload: { mode: string; qty: number }) {
      if (!detail.value) return;
      await runProductionAction(props.resource, detail.value.id, 'issue', payload);
      outsourceSendRows.value = [[
        'CK-WW-20260518001',
        detail.value.code,
        payload.mode,
        String(payload.qty),
        '原料仓',
        '张仓',
        '2026-05-18 16:30',
        payload.mode === '整批发料' ? '已发料' : '部分发料',
        '查看出库单',
      ]];
      showOutsourceIssue.value = false;
      actionMessage.value = '委外发料动作已通过 mock 接口提交，并回填委外发料记录。';
    }

    function openStartFlow(mode: 'plan' | 'order', line?: ProductionLine) {
      startMode.value = mode;
      flowLine.value = mode === 'order' ? null : line || null;
      showStartModal.value = true;
    }

    function skipStartCheck() {
      showStartModal.value = false;
      flowView.value = 'generated-orders';
      actionMessage.value = startMode.value === 'order'
        ? '已按需求产品明细生成生产订单列表。'
        : '已按计划产品明细生成生产订单列表。';
    }

    function startWithCheck() {
      showStartModal.value = false;
      startPlanFlow.value = true;
      if (props.resource === 'production-plans') activeTab.value = '齐套预估';
      showMrpModal.value = true;
    }

    function acceptMrpSuggestions(rows: string[][]) {
      kitRows.value = rows.map((row) => [...row]);
      showMrpModal.value = false;
      if (startPlanFlow.value) {
        flowView.value = 'generated-orders';
        startPlanFlow.value = false;
        actionMessage.value = 'MRP建议已采纳，已生成生产订单列表。';
        return;
      }
      activeTab.value = '齐套预估';
      actionMessage.value = 'MRP建议已采纳并回填齐套预估。';
    }

    function withdrawKitRow(index: number) {
      kitRows.value = kitRows.value.map((row, rowIndex) => (rowIndex === index
        ? [...row.slice(0, 9), '已撤回', '-', '已关闭', row[12] || '查看 / 撤回']
        : row));
      actionMessage.value = '齐套预估建议已撤回。';
    }

    async function confirmGeneratedPlan() {
      if (!detail.value) return;
      await runProductionAction(props.resource, detail.value.id, 'generate-plan', { productId: flowLine.value?.id });
      flowView.value = 'detail';
      activeTab.value = '产品明细';
      actionMessage.value = '生产计划已通过 mock 接口生成。';
    }

    async function confirmGeneratedOrders() {
      if (!detail.value) return;
      await runProductionAction(props.resource, detail.value.id, 'generate-orders', { productId: flowLine.value?.id });
      flowView.value = 'detail';
      activeTab.value = props.resource === 'production-plans' ? '齐套预估' : '产品明细';
      actionMessage.value = '生产订单已通过 mock 接口生成。';
    }

    async function confirmMaterialIssue() {
      if (!detail.value) return;
      await runProductionAction(props.resource, detail.value.id, 'material-issue', { processName: materialIssueStep.value?.processName });
      showMaterialIssue.value = false;
      actionMessage.value = '工序领料动作已通过 mock 接口提交。';
    }

    const handlers: ProductionDetailHandlers = {
      openGeneratedPlan: (line) => {
        flowLine.value = line;
        flowView.value = 'generated-plan';
      },
      openStartOrder: (line) => openStartFlow('order', line),
      openOutsourceIssue: () => { showOutsourceIssue.value = true; },
      get outsourceSendRows() {
        return outsourceSendRows.value;
      },
      openMrp: () => {
        startPlanFlow.value = false;
        showMrpModal.value = true;
      },
      get kitRows() {
        return kitRows.value;
      },
      openKitDoc: (row) => { kitDocRow.value = row; },
      withdrawKitRow,
      openMaterialIssue: (line) => {
        materialIssueStep.value = line;
        showMaterialIssue.value = true;
      },
    };

    function renderDetailPage() {
      if (!detail.value) return h('div', { class: 'aw-card' }, '正在加载详情...');
      if (flowView.value === 'generated-plan') {
        return renderGeneratedPlanView(detail.value, flowLine.value || detail.value.lines?.[0], () => {
          flowView.value = 'detail';
        }, confirmGeneratedPlan);
      }
      if (flowView.value === 'generated-orders') {
        return renderGeneratedProductionOrderList(detail.value, generatedProducts.value, () => {
          flowView.value = 'detail';
        }, confirmGeneratedOrders);
      }
      return h(AwDetailPage, null, {
        toolbar: () => h(AwDetailToolbar, { actions: actions.value, onBack: () => emit('back'), onAction: handleAction }),
        header: () => h(AwDetailHeader, {
          title: `${detail.value!.subject} ${detail.value!.code}`,
          code: detail.value!.code,
          statusText: detail.value!.statusName,
          statusTone: statusTone(detail.value!.statusName || detail.value!.status),
          metas: detailHeaderMetas(props.config, detail.value!),
        }),
        default: () => [
          h('section', { class: 'aw-card production-detail-card' }, [
            h(AwDetailTabs, { modelValue: activeTab.value, tabs: tabs.value, 'onUpdate:modelValue': (key: string) => { activeTab.value = key; } }),
            renderProductionDetailTab(props.resource, props.config, detail.value!, activeTab.value, editing.value, editText.value, (value) => { editText.value = value; }, saveEdit, handlers),
            actionMessage.value ? h('div', { class: 'aw-form-note production-detail-message' }, actionMessage.value) : null,
          ]),
          h(StartPlanConfirmModal, {
            open: showStartModal.value,
            mode: startMode.value,
            onCancel: () => { showStartModal.value = false; },
            onSkip: skipStartCheck,
            onCheck: startWithCheck,
          }),
          h(MrpSuggestionModal, {
            open: showMrpModal.value,
            tables: detail.value!.detailTables || {},
            onCancel: () => {
              showMrpModal.value = false;
              startPlanFlow.value = false;
            },
            onAccept: acceptMrpSuggestions,
          }),
          h(KitEstimateDocModal, {
            row: kitDocRow.value,
            onCancel: () => { kitDocRow.value = null; },
          }),
          h(MaterialIssueModal, {
            open: showMaterialIssue.value,
            row: detail.value!,
            step: materialIssueStep.value,
            table: detail.value!.detailTables?.materialIssueMaterials,
            onCancel: () => { showMaterialIssue.value = false; },
            onConfirm: confirmMaterialIssue,
          }),
          h(OutsourceIssueModal, {
            open: showOutsourceIssue.value,
            row: detail.value!,
            table: detail.value!.detailTables?.outsourceIssueMaterials,
            onCancel: () => { showOutsourceIssue.value = false; },
            onConfirm: confirmOutsourceIssue,
          }),
        ],
      });
    }

    return renderDetailPage;
  },
});

function detailTabs(resource: ProductionResource): DetailTabItem[] {
  const labels = resource === 'production-work-orders'
    ? ['工单信息', '工艺流程', '领工派工', '领料记录', '报工记录', '质检记录', '退料记录', '入库记录', '操作记录']
    : resource === 'outsource-orders'
      ? ['委外加工信息', '委外明细', '委外发料', '委外收货', '质检记录', '入库记录', '操作记录']
      : resource === 'production-orders'
        ? ['工单信息', '工单明细', '来源记录', '版本锁定', '齐套检查', '工序进度', '领料记录', '退料记录', '成品入库记录', '工单执行记录', '质检记录', '操作记录']
        : resource === 'production-plans'
          ? ['计划信息', '产品明细', '来源记录', '齐套预估', '排产记录', '操作记录']
          : ['基本信息', '产品明细', '操作记录'];
  return labels.map((label) => ({ key: label, label }));
}

function detailActions(resource: ProductionResource): DetailAction[] {
  const common: DetailAction[] = [
    { key: 'edit', label: '修改' },
    { key: 'delete', label: '删除' },
    { key: 'print', label: '打印' },
    { key: 'export', label: '导出' },
    { key: 'disable', label: '停用', danger: true },
  ];
  if (resource === 'production-plans') return [{ key: 'start', label: '启动计划' }, ...common];
  return common;
}

function detailHeaderMetas(config: ProductionConfig, row: ProductionDetail) {
  return [
    { label: '创建人', value: '老夏' },
    { label: '创建时间', value: '2026-05-17 10:25' },
    { label: config.ownerTitle, value: row.supplierName || row.ownerName || row.departmentName || '-' },
    { label: '打印状态', value: '未打印' },
  ];
}

function detailInfoFields(config: ProductionConfig, row: ProductionDetail): DetailFieldItem[] {
  if (config.lineMode === 'demand') {
    return [
      { label: config.subjectTitle, value: row.subject },
      { label: config.codeTitle, value: row.code },
      { label: '需求产品', value: row.productName },
      { label: '需求数量', value: String(row.quantity) },
      { label: config.statusTitle, value: row.statusName },
      { label: '需求部门', value: row.departmentName || row.ownerName || '-' },
      { label: '需求日期', value: row.startDate },
      { label: '交付日期', value: row.endDate },
    ];
  }
  const fields = [
    { label: config.subjectTitle, value: row.subject },
    { label: config.codeTitle, value: row.code },
    { label: '来源单据', value: row.sourceCode || '-' },
    { label: '生产产品', value: row.productName },
    { label: config.quantityTitle, value: String(row.quantity) },
    { label: config.statusTitle, value: row.statusName },
    { label: config.ownerTitle, value: row.supplierName || row.ownerName || row.departmentName || '-' },
    { label: '计划周期', value: `${row.startDate || '-'} 至 ${row.endDate || '-'}` },
  ];
  if (config.lineMode !== 'outsource') fields.push({ label: '齐套状态', value: row.kittingStatusName || '齐套' });
  if (config.lineMode === 'outsource') {
    fields.push({ label: '定价来源', value: row.pricingSource || '-' });
    fields.push({ label: '收货要求', value: row.receiptRequirement || '-' });
    fields.push({ label: '质检要求', value: row.qualityRequirement || '-' });
  }
  return fields;
}

function renderProductionDetailTab(resource: ProductionResource, config: ProductionConfig, row: ProductionDetail, tab: string, editing: boolean, editText: string, updateText: (value: string) => void, saveEdit: () => void, handlers: ProductionDetailHandlers) {
  if (tab.includes('信息') || tab === '基本信息') return renderProductionInfo(config, row, editing, editText, updateText, saveEdit);
  if (tab === '产品明细') return renderDetailLineTable(resource, row, handlers);
  if (tab === '工单明细' || tab === '工单执行记录') return renderWorkOrderDetail(row);
  if (tab === '委外明细') return renderOutsourceDetail(row);
  if (tab === '工艺流程') return renderProcessDetail(row, handlers.openMaterialIssue);
  if (tab === '领工派工') return renderDispatchDetail(row);
  if (tab === '来源记录') return renderNamedDetailTable('来源记录', row.detailTables?.source);
  if (tab === '版本锁定') return renderNamedDetailTable('版本锁定', row.detailTables?.version);
  if (tab === '齐套预估' && resource === 'production-plans') return renderKitEstimateSection(row, handlers);
  if (tab === '齐套检查' || tab === '齐套预估') return renderNamedDetailTable(tab, row.detailTables?.kit);
  if (tab === '排产记录') return renderNamedDetailTable('排产记录', row.detailTables?.schedule);
  if (tab === '工序进度') return renderNamedDetailTable('工序进度', row.detailTables?.process);
  if (tab.includes('领料')) return renderNamedDetailTable(tab, row.detailTables?.material);
  if (tab.includes('退料')) return renderNamedDetailTable(tab, row.detailTables?.return);
  if (tab.includes('入库')) return renderNamedDetailTable(tab, row.detailTables?.inbound);
  if (tab.includes('报工')) return renderNamedDetailTable(tab, row.detailTables?.report);
  if (tab.includes('质检')) return renderNamedDetailTable(tab, row.detailTables?.qc);
  if (tab.includes('委外发料')) return renderOutsourceSendPanel(row, row.detailTables?.outsourceSend, handlers.outsourceSendRows, handlers.openOutsourceIssue);
  if (tab.includes('委外收货')) return renderNamedDetailTable(tab, row.detailTables?.outsourceReceive);
  if (tab.includes('操作')) return renderNamedDetailTable(tab, row.detailTables?.op);
  return renderNamedDetailTable(tab, row.detailTables?.op);
}

function renderProductionInfo(config: ProductionConfig, row: ProductionDetail, editing: boolean, editText: string, updateText: (value: string) => void, saveEdit: () => void) {
  return [
    h('div', { class: 'aw-detail-section-title' }, '基础信息'),
    h(AwDetailInfoGrid, { items: detailInfoFields(config, row) }),
    h('div', { class: 'aw-detail-section-title' }, '详情'),
    editing
      ? h('div', { class: 'production-detail-edit' }, [
          h('textarea', { class: 'aw-input production-detail-textarea', value: editText, onInput: (event: Event) => updateText((event.target as HTMLTextAreaElement).value) }),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: saveEdit }, '保存修改'),
        ])
      : h('div', { class: 'production-readonly-detail' }, row.detailText || '-'),
    h('div', { class: 'aw-detail-section-title' }, '附件'),
    renderAttachments(row),
  ];
}

function renderAttachments(row: ProductionDetail) {
  return h('div', { class: 'production-attachments' }, (row.attachments || []).map((item) => h('div', { class: 'production-attachment', key: item.name }, [
    h('strong', item.name),
    h('span', `文件大小：${item.size}`),
    h('span', `上传日期：${item.date}`),
    h('div', [h('span', { class: 'aw-link' }, '查看'), h('span', { class: 'aw-link production-attachment-gap' }, '下载')]),
  ])));
}

function renderDetailLineTable(resource: ProductionResource, row: ProductionDetail, handlers: ProductionDetailHandlers) {
  const mode = resource === 'production-demands' ? 'demand' : resource === 'production-plans' ? 'plan' : 'demand';
  const columns = createLineColumns(mode).map((column) => column.title);
  const rows = (row.lines || []).map((line) => mode === 'demand'
    ? [
        line.sourceType || '-', line.sourceCode || '-', line.sourceLine || '-', line.productCode, line.productName, line.model, line.unit,
        String(line.demandQuantity || line.quantity || ''), line.requestDate || row.startDate || '-', line.deliveryDate || row.endDate || '-', line.remark || '-',
        [h('span', { class: 'aw-link', onClick: () => handlers.openGeneratedPlan(line) }, '计划'), h('span', { class: 'production-link-split' }, '/'), h('span', { class: 'aw-link', onClick: () => handlers.openStartOrder(line) }, '订单')],
      ]
    : [
        line.sourceType || '-', line.sourceCode || '-', line.sourceLine || '-', line.productCode, line.productName, line.model, line.unit,
        String(line.demandQuantity || line.quantity || ''), String(line.planQuantity || line.quantity || ''), line.startDate || row.startDate || '-', line.endDate || row.endDate || '-', line.remark || '-', h('span', { class: 'aw-link' }, '查看'),
      ]);
  return renderVNodeTable('产品明细', ['序号', ...columns, '操作'], rows);
}

function renderWorkOrderDetail(row: ProductionDetail) {
  const product = row.lines?.[0];
  const workRows = buildWorkOrderLines(product);
  const rows = workRows.map((line) => [
    line.workCode || '-', line.workType || '-', line.workName || '-', line.itemName || '-', line.processName || '-', line.stationName || '-', String(line.quantity || ''),
    String(line.completedQuantity || 0), String(line.goodQuantity || 0), String(line.badQuantity || 0), line.ownerName || '-', line.qmsStatus || '-', line.statusName || '-', h('span', { class: 'aw-link' }, '查看'),
  ]);
  return [
    h('div', { class: 'aw-form-note production-inline-note' }, '一个生产订单只对应一个产品；以下工单是该订单产品下的半成品工单、关键工序工单和成品总装工单。'),
    renderVNodeTable('工单明细', ['序号', '工单编号', '工单类型', '工单名称', '半成品/成品', '工序', '工位/产线', '计划数量', '已完成', '合格', '不良', '负责人', '质检节点', '状态', '操作'], rows),
  ];
}

function renderProcessDetail(row: ProductionDetail, openMaterialIssue: (line: ProductionLine) => void) {
  const rows = createProcessRows(row.lines?.[0]).map((line, index) => [
    line.processSeq || '-', line.processName || '-', line.processType || '-', line.stationName || '-', String(line.planQuantity || line.quantity || ''),
    line.standard || '-', line.startDate || '-', line.endDate || '-', index === 0 ? '领工模式' : '派工模式', line.ownerName || '-', line.statusName || '-', h('span', { class: 'aw-link', onClick: () => openMaterialIssue(line) }, '领料'),
  ]);
  return renderVNodeTable('工艺流程', ['序号', '工序号', '工序名称', '工序类型', '工位/产线', '计划数量', '作业标准', '计划开工', '计划完工', '领派方式', '负责人', '工序状态', '操作'], rows);
}

function renderDispatchDetail(row: ProductionDetail) {
  return [
    ...renderNamedDetailTable('领工记录', row.detailTables?.dispatchClaim),
    ...renderNamedDetailTable('派工记录', row.detailTables?.dispatchAssign),
  ];
}

function renderOutsourceDetail(row: ProductionDetail) {
  const columns = createOutsourceColumns('整单委外').map((column) => column.title);
  const rows = (row.lines || []).map((line) => [
    line.sourceCode || row.sourceCode || '-', line.productCode, line.productName, line.model, line.bomVersion || row.bomVersion || '-', line.bomLock || '待锁版',
    line.routeCode || row.routeCode || '-', line.routeLock || '待锁版', String(line.sourceQuantity || line.quantity || row.quantity || ''), String(line.outsourceQuantity || line.quantity || row.quantity || ''),
    line.unit, String(line.cost ?? ''), line.deliveryDate || row.endDate || '-', line.remark || '-', h('span', { class: 'aw-link' }, '查看'),
  ]);
  return renderVNodeTable('委外明细', ['序号', ...columns, '操作'], rows);
}

function renderOutsourceSendPanel(row: ProductionDetail, table: ProductionDetailTable | undefined, rows: string[][], openIssue: () => void) {
  const convertedRows = rows.map((cells) => cells.map((cell, index) => (index === cells.length - 1 ? h('span', { class: 'aw-link' }, cell) : cell)));
  const tableNodes = renderVNodeTable('委外发料', ['序号', ...(table?.columns || [])], convertedRows, h('div', { style: { padding: '18px 0', lineHeight: '1.8' } }, [
    h('strong', { style: { display: 'block', color: 'var(--aw-fg-1)' } }, '暂无发料记录'),
    h('span', { style: { color: 'var(--aw-fg-3)' } }, '点击右上角发料按钮，填写本次发料方式和数量后生成出库单'),
  ]));
  return [
    tableNodes[0],
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, [
      h('div', { class: 'aw-form-note production-inline-note', style: { marginBottom: '0', flex: '1' } }, '发料为手动动作，确认后生成仓储出库单，并回填委外发料记录。'),
      h('button', { class: 'aw-btn primary', type: 'button', onClick: openIssue }, '发料'),
    ]),
    tableNodes[1],
  ];
}

function renderKitEstimateSection(row: ProductionDetail, handlers: ProductionDetailHandlers) {
  if (!handlers.kitRows.length) {
    return [
      h('div', { class: 'aw-detail-section-title' }, '齐套预估'),
      h('div', { style: { minHeight: '160px', border: '1px dashed var(--aw-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', marginBottom: '12px' } }, [
        h('button', { class: 'aw-btn primary', type: 'button', onClick: handlers.openMrp }, '齐套检查'),
      ]),
    ];
  }

  const table = row.detailTables?.mrpAccepted;
  const rows = handlers.kitRows.map((cells, rowIndex) => cells.map((cell, cellIndex) => {
    if (cellIndex !== cells.length - 1) return cell;
    return [
      h('span', { class: 'aw-link', onClick: () => handlers.openKitDoc(cells) }, '查看'),
      h('span', { class: 'production-link-split' }, '/'),
      h('span', { class: 'aw-link', onClick: () => handlers.withdrawKitRow(rowIndex) }, '撤回'),
    ];
  }));
  const tableNodes = renderVNodeTable('齐套预估', ['序号', ...(table?.columns || [])], rows);
  return [
    tableNodes[0],
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' } }, [
      h('div', { class: 'aw-form-note production-inline-note', style: { marginBottom: '0', flex: '1' } }, 'MRP建议采纳后回填齐套预估；可查看生成单据或撤回建议。'),
      h('button', { class: 'aw-btn primary', type: 'button', onClick: handlers.openMrp }, '齐套检查'),
    ]),
    tableNodes[1],
  ];
}

function renderNamedDetailTable(title: string, table?: ProductionDetailTable) {
  return renderVNodeTable(title, ['序号', ...(table?.columns || [])], table?.rows || []);
}

function renderVNodeTable(title: string, columns: string[], rows: any[][], emptyCell: any = '暂无记录') {
  return [
    h('div', { class: 'aw-detail-section-title' }, title),
    h('div', { class: 'aw-doc-tbl-wrap' }, [
      h('div', { class: 'aw-doc-tbl-inner' }, [
        h('table', { class: 'aw-doc-tbl production-detail-table' }, [
          h('thead', [h('tr', columns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
          h('tbody', rows.length
            ? rows.map((cells, rowIndex) => h('tr', [h('td', String(rowIndex + 1)), ...cells.map((cell) => h('td', renderDetailCell(cell)))]))
            : [h('tr', [h('td', { colspan: columns.length, class: 'aw-empty-cell' }, renderDetailCell(emptyCell))])]),
        ]),
      ]),
    ]),
  ];
}

function renderDetailCell(cell: any) {
  if (Array.isArray(cell)) return cell;
  if (isVNode(cell)) return cell;
  const text = String(cell ?? '-');
  if (['齐套', '已完成', '已入库', '合格', '成功', '通过', '已发料', '已锁版', '已过账', '无需', '已确认', '已批准'].includes(text)) return h('span', { class: 'aw-status green' }, text);
  if (['缺料', '待复检'].includes(text)) return h('span', { class: 'aw-status red' }, text);
  if (['待审批', '生产中', '待质检', '部分领料', '待开工', '待入库', '已转计划', '待报工', '加工中', '待发料', '部分发料'].includes(text)) return h('span', { class: 'aw-status yellow' }, text);
  return text;
}

function renderFormGrid(fields: Array<{ label: string; value: string; required?: boolean; readonly?: boolean }>) {
  return h('div', { class: 'aw-doc-grid' }, fields.map((field) => h('label', { key: field.label }, [
    h('span', [field.label, field.required ? h('b', { style: { color: 'var(--aw-danger)', marginLeft: '4px' } }, '*') : null]),
    h('input', { class: 'aw-input', value: field.value, readonly: field.readonly !== false }),
  ])));
}

function renderGeneratedPlanView(row: ProductionDetail, product: ProductionLine | undefined, onBack: () => void, onSubmit: () => void) {
  const line = product || row.lines?.[0];
  const fields = [
    { label: '计划主题', value: `${line?.productName || row.productName} 生产计划`, required: true, readonly: false },
    { label: '计划编号', value: '自动生成' },
    { label: '来源需求', value: row.code },
    { label: '来源明细', value: line?.sourceLine || '-' },
    { label: '来源客户/项目', value: row.sourceName || row.customerName || '手动创建' },
    { label: '计划产品', value: line?.productName || row.productName },
    { label: '计划数量', value: String(line?.quantity || line?.demandQuantity || row.quantity || ''), required: true, readonly: false },
    { label: '计划开始', value: line?.startDate || row.startDate || '2026-05-18', readonly: false },
    { label: '计划完成', value: line?.endDate || row.endDate || '2026-05-30', readonly: false },
  ];
  const columns = createLineColumns('plan').map((column) => column.title);
  const rows = line ? [[
    line.sourceType || '生产需求',
    row.code,
    line.sourceLine || '-',
    line.productCode,
    line.productName,
    line.model,
    line.unit,
    String(line.demandQuantity || line.quantity || row.quantity || ''),
    String(line.planQuantity || line.quantity || row.quantity || ''),
    line.startDate || row.startDate || '-',
    line.endDate || row.endDate || '-',
    line.remark || '-',
    h('span', { class: 'aw-link' }, '查看'),
  ]] : [];
  const tableNodes = renderVNodeTable('产品明细', ['序号', ...columns, '操作'], rows);
  return h(AwFormPage, {
    actions: [{ key: 'submit', label: '生成生产计划', primary: true }],
    onBack,
    onAction: (key: string) => {
      if (key === 'submit') onSubmit();
    },
  }, {
    default: () => [
      h('section', { class: 'aw-card production-detail-card' }, [
        h('div', { class: 'aw-detail-section-title' }, '基础信息'),
        renderFormGrid(fields),
        tableNodes[0],
        tableNodes[1],
        h('div', { class: 'aw-detail-section-title' }, '计划说明'),
        h(AwRichTextEditor, { modelValue: '', placeholder: '填写排产、齐套、版本预锁和交付说明' }),
      ]),
    ],
  });
}

function renderGeneratedProductionOrderList(row: ProductionDetail, products: ProductionPickerProduct[], onBack: () => void, onSubmit: () => void) {
  const lines = products.length
    ? products.map((product) => lineFromProduct(product, { seeded: true, sourceType: '生产计划', sourceCode: row.code, sourceLine: product.sourceLine }))
    : row.lines || [];
  const rows = lines.map((line, index) => [
    `MO-20260518-${String(index + 1).padStart(3, '0')}`,
    `${line.productName}生产订单`,
    row.code,
    line.sourceLine || '-',
    line.productCode,
    line.productName,
    h('input', { class: 'aw-input', value: String(line.planQuantity || line.demandQuantity || line.quantity || row.quantity || ''), style: { width: '82px' } }),
    h('input', { class: 'aw-input', value: line.startDate || row.startDate || '2026-05-20', style: { width: '112px' } }),
    h('input', { class: 'aw-input', value: line.endDate || row.endDate || '2026-05-24', style: { width: '112px' } }),
    h('select', { class: 'aw-select', style: { width: '112px' } }, [line.bomVersion || row.bomVersion || 'BOM-V3.2', 'BOM-V3.3', 'BOM-V2.1'].map((item) => h('option', item))),
    h('select', { class: 'aw-select', style: { width: '96px' } }, ['待锁版', '已锁版', '提交时锁版'].map((item) => h('option', item))),
    h('select', { class: 'aw-select', style: { width: '128px' } }, [line.routeCode || row.routeCode || 'RT-总装-01', 'RT-焊接-02', 'RT-机加工-01'].map((item) => h('option', item))),
    h('select', { class: 'aw-select', style: { width: '96px' } }, ['待锁版', '已锁版', '开工时锁版'].map((item) => h('option', item))),
    h('select', { class: 'aw-select', style: { width: '158px' } }, [row.workshopName || '一号工厂 / 总装车间', '一号工厂 / 焊接车间', '二号工厂 / 机加工车间'].map((item) => h('option', item))),
    line.lineName || row.lineName || '总装产线A',
    h('select', { class: 'aw-select', style: { width: '112px' } }, [row.departmentName || row.ownerName || '生产一部', '生产一部', '装配车间', '计划调度部'].map((item) => h('option', item))),
    h('span', { class: 'aw-status yellow' }, '待生产'),
    h('span', { class: 'aw-link' }, '生成订单'),
  ]);
  const tableNodes = renderVNodeTable('生成的生产订单列表', ['序号', '生产订单编号', '订单主题', '来源计划', '来源明细', '产品编号', '生产产品', '生产数量', '建议开工', '建议完工', 'BOM版本', 'BOM锁版', '工艺路线', '工艺锁版', '工厂车间', '产线', '责任部门', '订单状态', '操作'], rows);
  return h(AwFormPage, {
    actions: [{ key: 'submit', label: '一键生成', primary: true }],
    onBack,
    onAction: (key: string) => {
      if (key === 'submit') onSubmit();
    },
  }, {
    default: () => [
      h('section', { class: 'aw-card production-detail-card' }, [
        tableNodes[0],
        h('div', { class: 'aw-form-note production-inline-note', style: { marginBottom: '12px' } }, '系统按生产计划产品明细一行一生产订单生成；生产订单确认后，再由生产订单拆分生成工单明细。'),
        tableNodes[1],
      ]),
    ],
  });
}

const StartPlanConfirmModal = defineComponent({
  name: 'StartPlanConfirmModal',
  props: {
    open: { type: Boolean, required: true },
    mode: { type: String as () => 'plan' | 'order', default: 'plan' },
  },
  emits: ['cancel', 'skip', 'check'],
  setup(props, { emit }) {
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', props.mode === 'order' ? '启动生产订单' : '启动生产计划'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { style: { fontSize: '14px', lineHeight: '1.8', color: 'var(--aw-fg-2)' } }, [
            props.mode === 'order' ? '启动订单前是否先进行齐套检查？' : '启动计划前是否先进行齐套检查？',
            h('br'),
            props.mode === 'order'
              ? '若不检查，系统将按需求产品明细直接生成生产订单列表；生产订单确认后再拆分工单明细，后续缺料风险需在订单齐套检查中处理。'
              : '若不检查，系统将按计划产品明细直接生成生产订单列表；生产订单确认后再拆分工单明细，后续缺料风险需在订单齐套检查中处理。',
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('skip') }, '不检查，直接生成订单'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('check') }, '先齐套检查'),
        ]),
      ]),
    ]) : null;
  },
});

const MrpSuggestionModal = defineComponent({
  name: 'MrpSuggestionModal',
  props: {
    open: { type: Boolean, required: true },
    tables: { type: Object as () => Record<string, ProductionDetailTable>, default: () => ({}) },
  },
  emits: ['cancel', 'accept'],
  setup(props, { emit }) {
    const step = ref<'config' | 'result'>('config');
    const tab = ref<'purchase' | 'produce'>('purchase');
    const scope = ref('全部仓库');
    const showWarehousePicker = ref(false);
    const warehouses = ref<string[]>([]);
    const pickedWarehouses = ref<string[]>([]);
    const warehouseRows = [
      ['WH-001', '成品仓', '海口总仓', '常温/冷藏', '可用'],
      ['WH-002', '原料仓', '海口工厂', '常温', '可用'],
      ['WH-003', '半成品仓', '海口工厂', '常温', '可用'],
      ['WH-004', '包材仓', '海口工厂', '常温', '可用'],
      ['WH-005', '委外暂存仓', '深圳协同加工厂', '常温', '可用'],
    ];

    watch(() => props.open, (open) => {
      if (open) {
        step.value = 'config';
        tab.value = 'purchase';
        scope.value = '全部仓库';
        showWarehousePicker.value = false;
        warehouses.value = [];
        pickedWarehouses.value = [];
      }
    });

    function renderMrpHelp() {
      const helpRows = [
        ['MRP运算', '可以根据销售订单的产品或任意选择生产物品的需求数量和需求日期结合配料、采购及前期等参数计算所需物料的采购时间、采购量和生产建议。'],
        ['规则', '在途数量：采购未入库数量；在产数量：生产未入库数量；委外待入库数量：委外未入库数量；生产占用量：生产计划消耗量减去累计领用量；可用库存=库存数量+在途数量+在产数量+委外待入库数量+生产占用量。选中后参与计算，不选则取库存数量。'],
        ['毛需求', '指导生产的信息，根据一定规则，从预测量和合同量中获取，表示需要量。'],
        ['净需求', '指现在库存不能满足合同量和安全库存量所缺少的部分，表示缺少量。'],
        ['损耗率', '在生产的各个环节中，有各种各样的损耗，因此在计算物料需求时，要考虑到各种损耗系数。'],
      ];
      return h('span', { class: 'aw-help-tip aw-help-down', tabindex: '0', 'aria-label': 'MRP运算说明' }, [
        '?',
        h('span', { class: 'aw-help-pop' }, [
          h('div', { style: { width: '820px', maxWidth: '78vw' } }, [
            h('table', { class: 'aw-table', style: { margin: '0' } }, [
              h('thead', [h('tr', [h('th', { style: { width: '110px' } }, '元素'), h('th', '说明')])]),
              h('tbody', helpRows.map((cells) => h('tr', { key: cells[0] }, [
                h('td', { style: { fontWeight: '600' } }, cells[0]),
                h('td', cells[1]),
              ]))),
            ]),
          ]),
        ]),
      ]);
    }

    function renderCheck(label: string, on = false) {
      return h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--aw-fg-2)', margin: '8px 0' } }, [
        h('span', { class: ['aw-chk', on ? 'on' : ''] }),
        label,
      ]);
    }

    function renderFormulaBox(title: string, items: Array<[string, boolean]>) {
      return h('div', { style: { border: '1px dashed var(--aw-border-strong)', padding: '12px 18px', minHeight: '130px', background: '#fff' } }, [
        h('div', { style: { fontSize: '13px', fontWeight: '600', marginBottom: '10px', textAlign: 'center' } }, title),
        ...items.map(([label, on]) => renderCheck(label, on)),
      ]);
    }

    function renderFormulaPanel(title: string, columns: Array<Array<[string, string]>>) {
      return h('div', { style: { border: '1px dashed var(--aw-border-strong)', padding: '14px 18px', minHeight: '210px', background: '#fff' } }, [
        h('div', { style: { fontSize: '13px', fontWeight: '600', marginBottom: '14px', textAlign: 'center' } }, title),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 34px' } }, columns.map((column) => h('div', column.map(([heading, label]) => h('div', { style: { marginBottom: '12px' } }, [
          h('div', { style: { fontWeight: '600', marginBottom: '7px' } }, heading),
          renderCheck(label),
        ]))))),
      ]);
    }

    function renderSuggestionTable(table?: ProductionDetailTable) {
      const columns = table?.columns || [];
      const rows = (table?.rows || []).map((cells) => cells.map((cell, index) => {
        if (index === 0) return h('span', { class: ['aw-chk', cell === '已选' ? 'on' : ''] });
        if (['建议采购日期', '建议采购量', '建议生产日期', '建议生产量'].includes(columns[index])) return h('input', { class: 'aw-input', value: cell, style: { width: index === 7 || index === 6 ? '118px' : '82px' } });
        return cell;
      }));
      return [
        h('div', { class: 'aw-detail-section-title' }, tab.value === 'purchase' ? '采购建议' : '生产建议'),
        h('div', { class: 'aw-doc-tbl-wrap' }, [
          h('div', { class: 'aw-doc-tbl-inner' }, [
            h('table', { class: 'aw-doc-tbl production-detail-table' }, [
              h('thead', [h('tr', columns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
              h('tbody', rows.length
                ? rows.map((cells) => h('tr', cells.map((cell) => h('td', renderDetailCell(cell)))))
                : [h('tr', [h('td', { colspan: columns.length, class: 'aw-empty-cell' }, '暂无记录')])]),
            ]),
          ]),
        ]),
      ];
    }

    function renderWarehousePicker() {
      return h('div', { class: 'aw-mask', onClick: () => { showWarehousePicker.value = false; } }, [
        h('div', { class: 'aw-modal lg production-mrp-picker-modal', style: { width: 'min(1040px, calc(100vw - 56px))' }, onClick: (event: Event) => event.stopPropagation() }, [
          h('div', { class: 'head' }, [
            h('span', ['选择仓库', h('span', { class: 'aw-modal-sub' }, '可多选参与或不参与 MRP 运算的仓库')]),
            h('button', { class: 'aw-modal-close', type: 'button', onClick: () => { showWarehousePicker.value = false; } }, '×'),
          ]),
          h('div', { class: 'body' }, [
            h('div', { class: 'production-picker-toolbar' }, [
              h('input', { class: 'aw-input', placeholder: '搜索仓库编号、仓库名称、地址' }),
            ]),
            h('div', { class: 'aw-doc-tbl-wrap' }, [
              h('div', { class: 'aw-doc-tbl-inner' }, [
                h('table', { class: 'aw-doc-tbl production-detail-table' }, [
                  h('thead', [h('tr', ['选择', '仓库编号', '仓库名称', '仓库地址', '温区', '状态'].map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
                  h('tbody', warehouseRows.map((cells) => h('tr', { key: cells[0], style: pickedWarehouses.value.includes(cells[0]) ? { background: 'var(--aw-primary-soft)' } : undefined, onClick: () => {
                    pickedWarehouses.value = pickedWarehouses.value.includes(cells[0])
                      ? pickedWarehouses.value.filter((code) => code !== cells[0])
                      : [...pickedWarehouses.value, cells[0]];
                  } }, [
                    h('td', [h('span', { class: ['aw-chk', pickedWarehouses.value.includes(cells[0]) ? 'on' : ''] })]),
                    ...cells.map((cell, index) => h('td', index === 4 ? renderDetailCell(cell) : cell)),
                  ]))),
                ]),
              ]),
            ]),
          ]),
          h('div', { class: 'foot' }, [
            h('button', { class: 'aw-btn', type: 'button', onClick: () => { showWarehousePicker.value = false; } }, '取消'),
            h('button', { class: 'aw-btn primary', type: 'button', onClick: () => {
              warehouses.value = [...pickedWarehouses.value];
              showWarehousePicker.value = false;
            } }, '确定'),
          ]),
        ]),
      ]);
    }

    return () => props.open ? [
      h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg production-mrp-modal', style: { width: 'min(1240px, calc(100vw - 40px))', height: 'min(736px, calc(100vh - 32px))', maxHeight: 'calc(100vh - 32px)' }, onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', step.value === 'config' ? ['MRP运算', renderMrpHelp()] : 'MRP运算建议'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body', style: { padding: '16px 20px' } }, step.value === 'config' ? [
          h('div', { style: { display: 'grid', gridTemplateColumns: '90px minmax(390px, 1fr) minmax(420px, 1.2fr)', gap: '10px 18px', alignItems: 'center', marginBottom: '18px', fontSize: '13px', color: 'var(--aw-fg-2)' } }, [
            h('div', { style: { fontWeight: '600', gridRow: '1 / span 2' } }, '计算范围：'),
            h('div', { style: { display: 'flex', gap: '34px', alignItems: 'center', flexWrap: 'wrap' } }, ['全部仓库', '选择参与计算的仓库'].map((item) => h('label', { class: ['aw-radio', scope.value === item ? 'on' : ''], onClick: () => { scope.value = item; } }, [
              h('span', { class: 'aw-dot' }),
              item,
            ]))),
            h('div', { style: { display: 'flex', gap: '8px' } }, [
              h('input', { class: 'aw-input', value: scope.value === '全部仓库' ? '全部仓库参与计算' : warehouses.value.join('、'), readonly: true, placeholder: '选择仓库范围' }),
              scope.value !== '全部仓库' ? h('button', { class: 'aw-btn', type: 'button', onClick: () => {
                pickedWarehouses.value = warehouses.value.length ? [...warehouses.value] : ['WH-001', 'WH-002'];
                showWarehousePicker.value = true;
              } }, '选择仓库') : null,
            ]),
            h('div', { style: { gridColumn: '2' } }, [
              h('label', { class: ['aw-radio', scope.value === '选择不参与计算的仓库' ? 'on' : ''], onClick: () => { scope.value = '选择不参与计算的仓库'; } }, [
                h('span', { class: 'aw-dot' }),
                '选择不参与计算的仓库',
              ]),
            ]),
          ]),
          h('div', { style: { display: 'grid', gridTemplateColumns: '90px 100px 20px minmax(210px, 1fr) 24px minmax(190px, .9fr) 24px minmax(210px, 1fr)', gap: '10px', alignItems: 'start', marginBottom: '18px', fontSize: '13px' } }, [
            h('div', { style: { fontWeight: '600', paddingTop: '8px' } }, '公式：'),
            h('button', { class: 'aw-btn', type: 'button' }, 'MRP建议量'),
            h('div', { style: { paddingTop: '7px', fontWeight: '700' } }, '='),
            renderFormulaBox('加项：需求量', [['不考虑不良率', true], ['考虑各环节物料不良率', false]]),
            h('div', { style: { paddingTop: '7px', fontWeight: '700' } }, '-'),
            renderFormulaBox('减项：现有库存', [['即时库存', false], ['预计可用库存', true]]),
            h('div', { style: { paddingTop: '7px', fontWeight: '700' } }, '+'),
            renderFormulaBox('加项：考虑安全库存', [['启用安全库存', false]]),
          ]),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' } }, [
            renderFormulaPanel('预计可用容材 = 及时库存量 + 预计入库量', [
              [['采购申请量：', '已审核采购申请单'], ['采购在途量：', '已审核采购订单'], ['调拨在途量：', '已审核调拨出库单'], ['委外在途量：', '已审核委外加工单'], ['生产在制量：', '已审核生产任务单']],
              [['采购待入库量：', '已审核采购订单'], ['其他待入库量：', '未审核其他入库单、盘盈单'], ['委外待入库量：', '未审核委外产品入库单'], ['生产待入库量：', '未审核产品入库单']],
            ]),
            renderFormulaPanel('减项：预计出库量 - 预留量', [
              [['销售占用量：', '已审核销售订单'], ['销售待出量：', '未审核销售出库订单'], ['其他待出量：', '未审核其他出库单、盘亏单'], ['委外占用量：', '已审核委外加工单'], ['生产占用量：', '已审核生产任务单']],
              [['调拨待出量：', '未审核调拨出库单'], ['委外待出量：', '未审核委外领料单'], ['生产待领料量：', '未审核生产领料单']],
            ]),
          ]),
        ] : [
          h('div', { style: { fontSize: '13px', lineHeight: '1.8', marginBottom: '14px', color: 'var(--aw-fg-2)' } }, [
            h('div', { style: { fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--aw-fg-1)' } }, '20240607计算销售00256MRP'),
            h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px 22px' } }, [
              h('span', '创建人：XXX'),
              h('span', '创建时间：2024-06-07 19:49:12'),
              h('span', 'MRP编号：MRP-20240607-0001'),
              h('span', '模拟类型：销售订单'),
              h('span', '建议量取值：毛需求'),
              h('span', '可用库存规则：在途数量、在产数量、委外待入库数'),
              h('span', '仓库名称：本地仓库、仓库二、仓库三'),
              h('span', '生产计划编号：SCJ4654847'),
            ]),
          ]),
          h('div', { class: 'aw-tabs', style: { marginBottom: '14px' } }, [
            h('button', { class: ['t', tab.value === 'purchase' ? 'on' : ''], type: 'button', onClick: () => { tab.value = 'purchase'; } }, '采购建议'),
            h('button', { class: ['t', tab.value === 'produce' ? 'on' : ''], type: 'button', onClick: () => { tab.value = 'produce'; } }, '生产建议'),
          ]),
          h('div', { style: { display: 'flex', gap: '10px', marginBottom: '12px' } }, tab.value === 'purchase'
            ? [h('button', { class: 'aw-btn primary', type: 'button' }, '请购'), h('button', { class: 'aw-btn primary', type: 'button' }, '采购')]
            : [h('button', { class: 'aw-btn primary', type: 'button' }, '内部生产'), h('button', { class: 'aw-btn primary', type: 'button' }, '委外加工')]),
          ...renderSuggestionTable(tab.value === 'purchase' ? props.tables.mrpPurchase : props.tables.mrpProduce),
        ]),
        h('div', { class: 'foot' }, step.value === 'config'
          ? [
              h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '关闭'),
              h('button', { class: 'aw-btn primary', type: 'button', onClick: () => { step.value = 'result'; } }, '确定'),
            ]
          : [
              h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '关闭'),
              h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('accept', props.tables.mrpAccepted?.rows || []) }, '采纳建议'),
            ]),
      ]),
    ]),
      showWarehousePicker.value ? renderWarehousePicker() : null,
    ] : null;
  },
});

const KitEstimateDocModal = defineComponent({
  name: 'KitEstimateDocModal',
  props: {
    row: { type: Array as unknown as () => string[] | null, default: null },
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    const titleMap: Record<string, string> = { 请购: '请购单详情', 采购: '采购订单详情', 内部生产: '生产订单详情', 委外加工: '委外单详情' };
    return () => props.row ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', [titleMap[props.row[0]] || '单据详情', h('span', { class: 'aw-modal-sub' }, props.row[1])]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h(AwDetailInfoGrid, { items: [
            { label: '单据类型', value: props.row[0] },
            { label: '单据编号', value: props.row[1] },
            { label: '生成状态', value: props.row[9] },
            { label: '确认状态', value: props.row[10] },
            { label: '单据状态', value: props.row[11] },
            { label: '物料/产品', value: `${props.row[3]} / ${props.row[2]}` },
            { label: '规格型号', value: props.row[4] },
            { label: '数量', value: props.row[6] },
            { label: '责任对象', value: props.row[8] },
            { label: '建议日期', value: props.row[7] },
            { label: '来源', value: 'MRP齐套预估采纳' },
          ] }),
          ...renderVNodeTable('单据明细', ['序号', '物料/产品编号', '名称', '规格型号', '单位', '数量', '交付/到货日期', '备注'], [[props.row[2], props.row[3], props.row[4], props.row[5], props.row[6], props.row[7], '由齐套预估采纳生成']]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('cancel') }, '关闭'),
        ]),
      ]),
    ]) : null;
  },
});

const MaterialIssueModal = defineComponent({
  name: 'MaterialIssueModal',
  props: {
    open: { type: Boolean, required: true },
    row: { type: Object as () => ProductionDetail, required: true },
    step: { type: Object as () => ProductionLine | null, default: null },
    table: { type: Object as () => ProductionDetailTable | undefined, default: undefined },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', ['工序领料', props.step ? h('span', { class: 'aw-modal-sub' }, `${props.step.processSeq || ''} ${props.step.processName || ''}`) : null]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-doc-grid', style: { marginBottom: '14px' } }, [
            h('label', [h('span', '生产产品'), h('input', { class: 'aw-input', value: `${props.row.productName} / ${props.row.lines?.[0]?.productCode || props.row.code}`, readonly: true })]),
            h('label', [h('span', '工序'), h('input', { class: 'aw-input', value: props.step ? `${props.step.processSeq || ''} ${props.step.processName || ''}` : '', readonly: true })]),
            h('label', [h('span', '工位/产线'), h('input', { class: 'aw-input', value: props.step?.stationName || '', readonly: true })]),
          ]),
          ...renderVNodeTable('领料明细', ['序号', ...(props.table?.columns || [])], (props.table?.rows || []).map((cells) => cells.map((cell, index) => {
            if (index !== cells.length - 1) return cell;
            return [
              h('span', { class: 'aw-link' }, '领料'),
              h('span', { class: 'production-link-split' }, '/'),
              h('span', { class: 'aw-link' }, '补料'),
              h('span', { class: 'production-link-split' }, '/'),
              h('span', { class: 'aw-link' }, '退料'),
            ];
          }))),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '关闭'),
          h('button', { class: 'aw-btn', type: 'button' }, '暂存'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm') }, '确认领料'),
        ]),
      ]),
    ]) : null;
  },
});

const OutsourceIssueModal = defineComponent({
  name: 'OutsourceIssueModal',
  props: {
    open: { type: Boolean, required: true },
    row: { type: Object as () => ProductionDetail, required: true },
    table: { type: Object as () => ProductionDetailTable | undefined, default: undefined },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const qtys = ref<string[]>([]);
    const rows = computed(() => props.table?.rows || []);
    watch(() => props.open, () => {
      qtys.value = rows.value.map((item) => item[6] || '0');
    }, { immediate: true });
    const totalQty = computed(() => qtys.value.reduce((sum, value) => sum + (Number(value) || 0), 0));
    const columns = computed(() => ['序号', ...(props.table?.columns || ['物料编码', '物料名称', '规格型号', '单位', '应发数量', '已发数量', '本次发料', '待发数量', '仓库/库位'])]);
    const issueMode = computed(() => (props.row as any).issueMode || (props.row as any).issueType || '按需发料');

    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', '委外发料'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-doc-grid', style: { marginBottom: '14px' } }, [
            h('label', [h('span', '委外单号'), h('input', { class: 'aw-input', value: props.row.code, readonly: true })]),
            h('label', [h('span', '加工商'), h('input', { class: 'aw-input', value: props.row.supplierName || '深圳协同加工厂', readonly: true })]),
            h('label', [h('span', '发料方式'), h('input', { class: 'aw-input', value: issueMode.value, readonly: true })]),
            h('label', [h('span', '本次发料数量'), h('input', { class: 'aw-input', value: String(totalQty.value), readonly: true })]),
            h('label', [h('span', '出库仓库'), h('select', { class: 'aw-select' }, ['原料仓', '半成品仓', '线边仓'].map((item) => h('option', item)))]),
            h('label', [h('span', '发料说明'), h('input', { class: 'aw-input', placeholder: '填写发料批次、运输或交接说明' })]),
          ]),
          h('div', { class: 'aw-doc-tbl-wrap' }, [
            h('div', { class: 'aw-doc-tbl-inner' }, [
              h('table', { class: 'aw-doc-tbl production-detail-table' }, [
                h('thead', [h('tr', columns.value.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
                h('tbody', rows.value.map((cells, rowIndex) => h('tr', [
                  h('td', String(rowIndex + 1)),
                  ...cells.map((cell, cellIndex) => h('td', cellIndex === 6
                    ? h('input', {
                        class: 'aw-input',
                        value: qtys.value[rowIndex] || '',
                        placeholder: '填写本次发料',
                        onInput: (event: Event) => { qtys.value[rowIndex] = (event.target as HTMLInputElement).value; },
                      })
                    : cellIndex === 7
                      ? String(Math.max(0, Number(cell || 0) - (Number(qtys.value[rowIndex]) || 0)))
                      : cell)),
                ]))),
              ]),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', { mode: issueMode.value, qty: totalQty.value }) }, '确认发料'),
        ]),
      ]),
    ]) : null;
  },
});

const ProductionDemandSummaryPage = defineComponent({
  name: 'ProductionDemandSummaryPage',
  emits: ['back'],
  setup(_, { emit }) {
    const rows = ref<ProductionDemandSummaryRow[]>([]);
    const selected = ref<ProductionDemandSummaryRow | null>(null);
    const keyword = ref('');
    const message = ref('');
    const columns: AwTableColumn[] = [
      { key: 'code', title: '产品编号', width: 150 },
      { key: 'product', title: '产品名称', width: 150 },
      { key: 'model', title: '规格型号', width: 120 },
      { key: 'unit', title: '单位', width: 80 },
      { key: 'sourceCount', title: '需求来源数', numeric: true, width: 110 },
      { key: 'plan', title: '需求数量', numeric: true, width: 110 },
      { key: 'done', title: '已生产', numeric: true, width: 100 },
      { key: 'left', title: '还需生产', numeric: true, width: 110 },
      { key: 'date', title: '交付日期', width: 120 },
      { key: 'status', title: '状态', width: 110, filterOptions: ['待生产', '生产中', '已完工'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ];
    const sourceColumns = ['序号', '来源单据', '来源类型', '来源对象', '来源明细', '需求数量', '已生产', '还需生产', '交付日期', '状态'];
    const tableRows = computed<Record<string, unknown>[]>(() => rows.value
      .filter((row) => !keyword.value || [row.code, row.product, row.status, ...row.sources.map((source) => source.sourceDoc)].some((value) => String(value).includes(keyword.value)))
      .map((row) => ({ ...row, sourceCount: row.sources.length, action: '查看' })));
    async function load() {
      const result = await listProductionDemandSummary();
      rows.value = result.items;
    }
    onMounted(load);
    return () => h(AwListPage, {}, {
      default: () => [
        h('section', { class: 'aw-detail-toolbar' }, [
          h('button', { class: 'aw-back-btn', type: 'button', onClick: () => selected.value ? selected.value = null : emit('back') }, [h('span', { class: 'aw-line-icon line-back' }), selected.value ? '返回汇总列表' : '返回生产需求列表']),
        ]),
        selected.value
          ? h('section', { class: 'aw-card production-action-page' }, [
              h('div', { class: 'section-title' }, `${selected.value.product} 需求数量与来源列表`),
              h(AwDetailInfoGrid, { items: [
                { label: '产品编号', value: selected.value.code },
                { label: '产品名称', value: selected.value.product },
                { label: '规格型号', value: selected.value.model },
                { label: '单位', value: selected.value.unit },
                { label: '需求数量', value: String(selected.value.plan) },
                { label: '已生产数量', value: String(selected.value.done) },
                { label: '还需生产数量', value: String(selected.value.left) },
                { label: '交付日期', value: selected.value.date },
                { label: '需求状态', value: selected.value.status },
              ] }),
              h('div', { class: 'aw-detail-section-title' }, '来源明细'),
              h('div', { class: 'aw-doc-tbl-wrap' }, [
                h('div', { class: 'aw-doc-tbl-inner' }, [
                  h('table', { class: 'aw-doc-tbl production-detail-table' }, [
                    h('thead', [h('tr', sourceColumns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
                    h('tbody', selected.value.sources.map((source, index) => h('tr', [
                      h('td', index + 1),
                      h('td', [h('span', { class: 'aw-link' }, source.sourceDoc)]),
                      h('td', source.sourceType),
                      h('td', source.sourceObject),
                      h('td', source.sourceLine),
                      h('td', { class: 'aw-num' }, source.demandQty),
                      h('td', { class: 'aw-num' }, source.doneQty),
                      h('td', { class: 'aw-num' }, source.leftQty),
                      h('td', source.deliveryDate),
                      h('td', [h('span', { class: ['aw-status', statusTone(source.status)] }, source.status)]),
                    ]))),
                  ]),
                ]),
              ]),
            ])
          : h('section', { class: 'aw-card production-action-page' }, [
              h('div', { class: 'section-title' }, '生产需求汇总'),
              h(AwListToolbar, {
                searchPlaceholder: '全局搜索（如产品名称、产品编号、需求来源）',
                actions: ['refresh', 'filter', 'columns', 'export'],
                onSearch: (value: string) => { keyword.value = value; },
                onRefresh: load,
                onFilter: () => { message.value = '筛选抽屉沿用列表母版，当前可按状态列筛选。'; },
                onColumns: () => { message.value = '字段配置入口已接入，设置页可维护生产需求字段。'; },
                onExport: () => { message.value = '生产需求汇总导出动作已触发，等待对接导出接口。'; },
              }),
              message.value ? h('div', { class: 'aw-form-note production-list-message' }, message.value) : null,
              h(AwDataTable, {
                columns,
                rows: tableRows.value,
                rowKey: 'id',
                total: tableRows.value.length,
                bulkActions: [{ key: 'bulk', label: '批量操作' }],
                fitWidth: columns.length <= 9,
              }, {
                cell: ({ column, record, value }: { column: AwTableColumn; record: Record<string, unknown>; value: unknown }) => {
                  if (column.key === 'status') return h('span', { class: ['aw-status', statusTone(value)] }, String(value || '-'));
                  if (column.key === 'left') return h('span', { class: 'aw-num', style: { color: Number(value || 0) ? 'var(--aw-danger)' : 'var(--aw-success)' } }, String(formatCell(value, true)));
                  if (column.key === 'action') return h('span', { class: 'aw-link', onClick: () => { selected.value = rows.value.find((row) => row.id === record.id) || null; } }, '查看');
                  return formatCell(value, column.numeric);
                },
              }),
            ]),
      ],
    });
  },
});

function workOrderActionLinks(items: Array<{ label: string; onClick?: () => void }>) {
  return items.flatMap((item, index) => [
    index > 0 ? h('span', { class: 'production-link-split' }, '/') : null,
    h('span', { class: 'aw-link', onClick: item.onClick }, item.label),
  ]);
}

function simpleReportTable(columns: string[], rows: string[][]) {
  return h('div', { class: 'aw-doc-tbl-wrap' }, [
    h('div', { class: 'aw-doc-tbl-inner' }, [
      h('table', { class: 'aw-doc-tbl production-detail-table' }, [
        h('thead', [h('tr', columns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
        h('tbody', rows.map((cells, index) => h('tr', [h('td', index + 1), ...cells.map((cell) => h('td', cell))]))),
      ]),
    ]),
  ]);
}

const WorkOrderClaimModal = defineComponent({
  name: 'WorkOrderClaimModal',
  props: {
    row: { type: Object as () => WorkOrderClaimTask | null, default: null },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const qty = ref('');
    watch(() => props.row, (row) => { qty.value = String(row?.canClaim || ''); }, { immediate: true });
    return () => props.row ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', ['领取工序任务', h('span', { class: 'aw-modal-sub' }, `${props.row.workNo} / ${props.row.process}`)]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-form-grid', style: { gridTemplateColumns: '1fr' } }, [
            field('可领取数量', h('input', { class: 'aw-input', value: props.row.canClaim, readonly: true })),
            field('本次领工数量', h('input', { class: 'aw-input', value: qty.value, placeholder: '填写本次领取数量', onInput: (event: Event) => { qty.value = (event.target as HTMLInputElement).value; } }), true),
          ]),
          h('div', { class: 'aw-form-note', style: { marginTop: '10px' } }, '确认后，该数量会进入你的报工责任范围，后续任务报工不得超过已领数量。'),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', { ...props.row, claimQty: qty.value }) }, '确认领工'),
        ]),
      ]),
    ]) : null;
  },
});

const WorkOrderDispatchDetailModal = defineComponent({
  name: 'WorkOrderDispatchDetailModal',
  props: {
    row: { type: Object as () => Partial<WorkOrderClaimTask & WorkOrderAssignedTask> | null, default: null },
    detail: { type: Object as () => { metrics: DetailFieldItem[]; claimRows: string[][]; assignRows: string[][] } | null, default: null },
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    return () => props.row && props.detail ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', ['领工派工明细', h('span', { class: 'aw-modal-sub' }, `${props.row.workNo || ''} / ${props.row.process || ''}`)]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h(AwDetailInfoGrid, { items: props.detail.metrics }),
          h('div', { class: 'aw-detail-section-title' }, '谁领了多少'),
          simpleReportTable(['序号', '人员', '方式', '领取数量', '已报工', '待报工', '领取时间', '状态'], props.detail.claimRows),
          h('div', { class: 'aw-detail-section-title' }, '派给谁多少'),
          simpleReportTable(['序号', '人员', '方式', '派工数量', '已报工', '待报工', '分派人', '分派时间', '状态'], props.detail.assignRows),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('cancel') }, '关闭'),
        ]),
      ]),
    ]) : null;
  },
});

const WorkOrderDispatchPage = defineComponent({
  name: 'WorkOrderDispatchPage',
  emits: ['back'],
  setup(_, { emit }) {
    const router = useRouter();
    const tab = ref<'pool' | 'assigned'>('pool');
    const keyword = ref('');
    const poolRows = ref<WorkOrderClaimTask[]>([]);
    const assignedRows = ref<WorkOrderAssignedTask[]>([]);
    const claimRow = ref<WorkOrderClaimTask | null>(null);
    const detailRow = ref<Partial<WorkOrderClaimTask & WorkOrderAssignedTask> | null>(null);
    const dispatchDetail = ref<{ metrics: DetailFieldItem[]; claimRows: string[][]; assignRows: string[][] } | null>(null);
    const message = ref('');
    const poolColumns: AwTableColumn[] = [
      { key: 'workNo', title: '工单编号', width: 150 },
      { key: 'product', title: '产品名称', width: 150 },
      { key: 'process', title: '工序名称', width: 120 },
      { key: 'planQty', title: '计划数量', numeric: true, width: 100 },
      { key: 'claimedQty', title: '已领数量', numeric: true, width: 100 },
      { key: 'canClaim', title: '可领数量', numeric: true, width: 100 },
      { key: 'station', title: '工位/产线', width: 140 },
      { key: 'start', title: '计划开工', width: 120 },
      { key: 'status', title: '任务状态', width: 100 },
      { key: 'action', title: '操作', width: 120, fixed: 'right' },
    ];
    const assignedColumns: AwTableColumn[] = [
      { key: 'workNo', title: '工单编号', width: 150 },
      { key: 'product', title: '产品名称', width: 150 },
      { key: 'process', title: '工序名称', width: 120 },
      { key: 'assignTo', title: '分派人员', width: 110 },
      { key: 'assignQty', title: '分派数量', numeric: true, width: 100 },
      { key: 'reportedQty', title: '已报工', numeric: true, width: 90 },
      { key: 'leftQty', title: '待报工', numeric: true, width: 90 },
      { key: 'station', title: '工位/产线', width: 130 },
      { key: 'assigner', title: '分派人', width: 100 },
      { key: 'status', title: '任务状态', width: 100 },
      { key: 'action', title: '操作', width: 120, fixed: 'right' },
    ];
    const activeRows = computed(() => (tab.value === 'pool' ? poolRows.value : assignedRows.value).filter((row) => !keyword.value || JSON.stringify(row).includes(keyword.value)) as Record<string, unknown>[]);
    async function load() {
      const [pool, assigned] = await Promise.all([listWorkOrderClaimTasks(), listWorkOrderAssignedTasks()]);
      poolRows.value = pool.items;
      assignedRows.value = assigned.items;
    }
    async function confirmClaim(payload: WorkOrderClaimTask & { claimQty?: string }) {
      await createWorkOrderClaim(payload);
      claimRow.value = null;
      tab.value = 'assigned';
      message.value = '确认领工已通过 mock 接口提交，并回填派工列表。';
      await load();
    }
    async function openDispatchDetail(row: WorkOrderClaimTask | WorkOrderAssignedTask) {
      detailRow.value = row;
      dispatchDetail.value = await getWorkOrderDispatchDetail(row) as any;
    }
    onMounted(load);
    return () => h(AwListPage, {}, {
      default: () => [
        h('section', { class: 'aw-detail-toolbar' }, [
          h('button', { class: 'aw-back-btn', type: 'button', onClick: () => emit('back') }, [h('span', { class: 'aw-line-icon line-back' }), '返回生产工单列表']),
        ]),
        h('section', { class: 'aw-card production-action-page' }, [
          h('div', { class: 'section-title' }, [h('span', '领工派工'), h('span', { class: 'aw-card-meta' }, '(999)')]),
          h('div', { class: 'aw-tabs' }, [
            h('button', { class: ['t', tab.value === 'pool' ? 'on' : ''], type: 'button', onClick: () => { tab.value = 'pool'; } }, '领工任务池'),
            h('button', { class: ['t', tab.value === 'assigned' ? 'on' : ''], type: 'button', onClick: () => { tab.value = 'assigned'; } }, '派工列表'),
          ]),
          h(AwListToolbar, {
            searchPlaceholder: '全局搜索（如工单编号、产品名称、负责人...）',
            actions: ['refresh', 'filter', 'columns', 'export'],
            onSearch: (value: string) => { keyword.value = value; },
            onRefresh: load,
          }),
          message.value ? h('div', { class: 'aw-form-note production-list-message' }, message.value) : null,
          h(AwDataTable, {
            columns: tab.value === 'pool' ? poolColumns : assignedColumns,
            rows: activeRows.value,
            rowKey: 'id',
            total: activeRows.value.length,
            bulkActions: [{ key: 'bulk', label: '批量操作' }],
          }, {
            cell: ({ column, record, value }: { column: AwTableColumn; record: Record<string, unknown>; value: unknown }) => {
              if (column.key === 'status') return h('span', { class: ['aw-status', statusTone(value)] }, String(value || '-'));
              if (column.key === 'action') {
                return tab.value === 'pool'
                  ? workOrderActionLinks([
                      { label: '领工', onClick: () => { claimRow.value = record as unknown as WorkOrderClaimTask; } },
                      { label: '查看', onClick: () => { void openDispatchDetail(record as unknown as WorkOrderClaimTask); } },
                    ])
                  : workOrderActionLinks([
                      { label: '报工', onClick: () => { router.push({ path: '/production/production-work-orders', query: { action: '任务报工' } }); } },
                      { label: '查看', onClick: () => { void openDispatchDetail(record as unknown as WorkOrderAssignedTask); } },
                    ]);
              }
              return formatCell(value, column.numeric);
            },
          }),
        ]),
        h(WorkOrderClaimModal, { row: claimRow.value, onCancel: () => { claimRow.value = null; }, onConfirm: confirmClaim }),
        h(WorkOrderDispatchDetailModal, { row: detailRow.value, detail: dispatchDetail.value, onCancel: () => { detailRow.value = null; dispatchDetail.value = null; } }),
      ],
    });
  },
});

const WorkOrderReportDetailModal = defineComponent({
  name: 'WorkOrderReportDetailModal',
  props: {
    row: { type: Object as () => WorkOrderReportRecord | null, default: null },
    detail: { type: Object as () => { metrics: DetailFieldItem[]; rows: string[][] } | null, default: null },
  },
  emits: ['cancel'],
  setup(props, { emit }) {
    return () => props.row && props.detail ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', ['工序报工明细', h('span', { class: 'aw-modal-sub' }, `${props.row.workNo} / ${props.row.process}`)]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h(AwDetailInfoGrid, { items: props.detail.metrics }),
          h('div', { class: 'aw-detail-section-title' }, '报工记录'),
          simpleReportTable(['序号', '报工单号', '报工批次', '报工人', '本次报工', '合格', '不良', '返工', '报工时间', '状态'], props.detail.rows),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('cancel') }, '关闭'),
        ]),
      ]),
    ]) : null;
  },
});

const WorkOrderReportPersonModal = defineComponent({
  name: 'WorkOrderReportPersonModal',
  props: {
    open: { type: Boolean, required: true },
    groups: { type: Array as () => WorkOrderReportPeopleGroup[], default: () => [] },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const activeGroup = ref('');
    const picked = ref<WorkOrderReportPerson | null>(null);
    const people = computed(() => props.groups.find((group) => group.group === activeGroup.value)?.people || []);
    watch(() => props.open, (open) => {
      if (!open) return;
      activeGroup.value = props.groups[0]?.group || '';
      picked.value = null;
    }, { immediate: true });
    watch(() => props.groups, (groups) => {
      if (!activeGroup.value) activeGroup.value = groups[0]?.group || '';
    }, { immediate: true });
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', ['选择报工人员', h('span', { class: 'aw-modal-sub' }, '仅显示当前工序相关的车间、产线、班组人员')]),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'production-product-picker', style: { minHeight: '430px' } }, [
            h('div', { class: 'production-source-types' }, [
              h('div', { style: { fontSize: '13px', fontWeight: '600', padding: '4px 8px 10px' } }, '相关组织'),
              ...props.groups.map((group, index) => h('div', {
                class: ['aw-picker-tree-row', { on: activeGroup.value === group.group }],
                onClick: () => { activeGroup.value = group.group; picked.value = null; },
              }, [h('span', index < 2 ? '▼' : ''), group.group])),
            ]),
            h('div', { class: 'production-source-list' }, [
              h('div', { class: 'production-picker-toolbar' }, [
                h('input', { class: 'aw-input', placeholder: '搜索相关报工人员' }),
                h('span', `当前分组 ${people.value.length} 人`),
              ]),
              h('div', { class: 'aw-doc-tbl-wrap' }, [
                h('div', { class: 'aw-doc-tbl-inner' }, [
                  h('table', { class: 'aw-doc-tbl production-detail-table' }, [
                    h('thead', [h('tr', ['选择', '姓名', '工号', '部门', '产线/班组', '岗位'].map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
                    h('tbody', people.value.map((person) => h('tr', {
                      key: person.id,
                      style: picked.value?.id === person.id ? { background: 'var(--aw-primary-soft)' } : undefined,
                      onClick: () => { picked.value = person; },
                    }, [
                      h('td', [h('span', { class: ['aw-chk', picked.value?.id === person.id ? 'on' : ''] })]),
                      h('td', person.name),
                      h('td', person.id),
                      h('td', person.dept),
                      h('td', person.line),
                      h('td', person.role),
                    ]))),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => { if (picked.value) emit('confirm', picked.value); } }, '确定'),
        ]),
      ]),
    ]) : null;
  },
});

const WorkOrderReportRecordPage = defineComponent({
  name: 'WorkOrderReportRecordPage',
  emits: ['back'],
  setup(_, { emit }) {
    const role = ref<'worker' | 'admin'>('worker');
    const keyword = ref('');
    const start = ref('2026-05-18');
    const end = ref('2026-05-18');
    const rows = ref<WorkOrderReportRecord[]>([]);
    const selectedPerson = ref('');
    const peopleGroups = ref<WorkOrderReportPeopleGroup[]>([]);
    const showPeople = ref(false);
    const detailRow = ref<WorkOrderReportRecord | null>(null);
    const reportDetail = ref<{ metrics: DetailFieldItem[]; rows: string[][] } | null>(null);
    const columns: AwTableColumn[] = [
      { key: 'workNo', title: '工单编号', width: 150 },
      { key: 'product', title: '产品名称', width: 150 },
      { key: 'process', title: '工序名称', width: 120 },
      { key: 'dept', title: '生产部门', width: 120 },
      { key: 'person', title: '报工人', width: 100 },
      { key: 'source', title: '报工来源', width: 110 },
      { key: 'planQty', title: '计划数量', numeric: true, width: 100 },
      { key: 'allowQty', title: '可报数量', width: 100 },
      { key: 'reportedQty', title: '累计报工', numeric: true, width: 100 },
      { key: 'goodQty', title: '合格', numeric: true, width: 80 },
      { key: 'badQty', title: '不良', numeric: true, width: 80 },
      { key: 'count', title: '报工次数', numeric: true, width: 95 },
      { key: 'lastTime', title: '最后报工时间', width: 150 },
      { key: 'status', title: '状态', width: 100 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ];
    const visibleRows = computed(() => rows.value.filter((row) => {
      const roleMatched = role.value === 'admin' || row.person === '三红';
      const personMatched = !selectedPerson.value || row.person === selectedPerson.value;
      const keywordMatched = !keyword.value || JSON.stringify(row).includes(keyword.value);
      return roleMatched && personMatched && keywordMatched;
    }) as unknown as Record<string, unknown>[]);
    async function load() {
      const [records, people] = await Promise.all([listWorkOrderReportRecords(), listWorkOrderReportPeople()]);
      rows.value = records.items;
      peopleGroups.value = people;
    }
    async function openDetail(row: WorkOrderReportRecord) {
      detailRow.value = row;
      reportDetail.value = await getWorkOrderReportDetail(row) as any;
    }
    function setDay(day: 'today' | 'yesterday') {
      start.value = day === 'today' ? '2026-05-18' : '2026-05-17';
      end.value = start.value;
    }
    onMounted(load);
    return () => h(AwListPage, {}, {
      default: () => [
        h('section', { class: 'aw-detail-toolbar' }, [
          h('button', { class: 'aw-back-btn', type: 'button', onClick: () => emit('back') }, [h('span', { class: 'aw-line-icon line-back' }), '返回生产工单列表']),
        ]),
        h('section', { class: 'aw-card production-action-page' }, [
          h('div', { class: 'section-title' }, [h('span', '报工记录'), h('span', { class: 'aw-card-meta' }, '(999)')]),
          h('div', { class: 'aw-tabs' }, [
            h('button', { class: ['t', role.value === 'worker' ? 'on' : ''], type: 'button', onClick: () => { role.value = 'worker'; selectedPerson.value = ''; } }, '我的报工'),
            h('button', { class: ['t', role.value === 'admin' ? 'on' : ''], type: 'button', onClick: () => { role.value = 'admin'; } }, '管理员视图'),
          ]),
          h(AwListToolbar, {
            searchPlaceholder: '全局搜索（如工单编号、产品名称、工序名称、报工人...）',
            actions: ['refresh', 'filter', 'columns', 'export'],
            onSearch: (value: string) => { keyword.value = value; },
            onRefresh: load,
          }),
          h('div', { class: 'production-report-filters' }, [
            role.value === 'admin' ? h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => { showPeople.value = true; } }, selectedPerson.value || '选择人员') : null,
            h('input', { class: 'aw-input', value: start.value, onInput: (event: Event) => { start.value = (event.target as HTMLInputElement).value; } }),
            h('span', '至'),
            h('input', { class: 'aw-input', value: end.value, onInput: (event: Event) => { end.value = (event.target as HTMLInputElement).value; } }),
            h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => setDay('yesterday') }, '昨天'),
            h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => setDay('today') }, '今天'),
          ]),
          h(AwDataTable, {
            columns,
            rows: visibleRows.value,
            rowKey: 'id',
            total: visibleRows.value.length,
            bulkActions: [{ key: 'bulk', label: '批量操作' }],
          }, {
            cell: ({ column, record, value }: { column: AwTableColumn; record: Record<string, unknown>; value: unknown }) => {
              if (column.key === 'status') return h('span', { class: ['aw-status', statusTone(value)] }, String(value || '-'));
              if (column.key === 'action') return h('span', { class: 'aw-link', onClick: () => { void openDetail(record as unknown as WorkOrderReportRecord); } }, '查看');
              return formatCell(value, column.numeric);
            },
          }),
        ]),
        h(WorkOrderReportDetailModal, { row: detailRow.value, detail: reportDetail.value, onCancel: () => { detailRow.value = null; reportDetail.value = null; } }),
        h(WorkOrderReportPersonModal, {
          open: showPeople.value,
          groups: peopleGroups.value,
          onCancel: () => { showPeople.value = false; },
          onConfirm: (person: WorkOrderReportPerson) => {
            selectedPerson.value = person.name || '';
            showPeople.value = false;
          },
        }),
      ],
    });
  },
});

const WorkOrderReportPage = defineComponent({
  name: 'WorkOrderReportPage',
  emits: ['back'],
  setup(_, { emit }) {
    const sourceMode = ref('领工派工');
    const message = ref('');
    const form = reactive({
      workNo: 'WO-20260517001',
      product: '智能温控终端',
      process: '总装',
      person: '三红',
      reportedQty: 80,
      goodQty: 78,
      badQty: 2,
      reportTime: '2026-05-20 17:30',
    });
    const isFree = computed(() => sourceMode.value === '自由模式');
    async function submit() {
      await createWorkOrderReport({
        workNo: form.workNo,
        product: form.product,
        process: isFree.value ? '自由报工' : form.process,
        person: form.person,
        source: sourceMode.value,
        planQty: 120,
        allowQty: isFree.value ? '-' : 80,
        reportedQty: Number(form.reportedQty || 0),
        goodQty: Number(form.goodQty || 0),
        badQty: Number(form.badQty || 0),
        lastTime: form.reportTime,
      });
      message.value = '报工提交成功，已通过 mock 接口生成待质检记录。';
    }
    return () => h(AwFormPage, {
      backText: '关闭',
      actions: [{ key: 'draft', label: '暂存' }, { key: 'submit', label: '确定', primary: true }],
      onBack: () => emit('back'),
      onAction: (key: string) => {
        if (key === 'submit') void submit();
        else message.value = '报工暂存成功。';
      },
    }, {
      default: () => [
        message.value ? h('div', { class: 'aw-form-note production-list-message' }, message.value) : null,
        h('section', { class: 'aw-card production-action-page' }, [
          h('div', { class: 'section-title' }, '报工信息'),
          h('div', { class: 'aw-form-grid' }, [
            field('生产工单', h('input', { class: 'aw-input', value: `${form.workNo} 总装工序生产工单`, readonly: true }), true),
            field('报工来源', h('select', { class: 'aw-select', value: sourceMode.value, onChange: (event: Event) => { sourceMode.value = (event.target as HTMLSelectElement).value; } }, ['领工派工', '自由模式'].map((item) => h('option', item)))),
            field('报工工序', h('input', { class: 'aw-input', value: isFree.value ? '按权限自由选择工序' : form.process, readonly: true }), true),
            field('报工人', h('input', { class: 'aw-input', value: form.person, onInput: (event: Event) => { form.person = (event.target as HTMLInputElement).value; } }), true),
            field('报工数量', h('input', { class: 'aw-input', value: String(form.reportedQty), onInput: (event: Event) => { form.reportedQty = Number((event.target as HTMLInputElement).value || 0); } }), true),
            field('合格数量', h('input', { class: 'aw-input', value: String(form.goodQty), onInput: (event: Event) => { form.goodQty = Number((event.target as HTMLInputElement).value || 0); } }), true),
            field('不良数量', h('input', { class: 'aw-input', value: String(form.badQty), onInput: (event: Event) => { form.badQty = Number((event.target as HTMLInputElement).value || 0); } })),
            field('工位/产线', h('input', { class: 'aw-input', value: isFree.value ? '按人员权限自动匹配' : '总装工位01', readonly: true })),
            field('报工时间', h('input', { class: 'aw-input', value: form.reportTime, onInput: (event: Event) => { form.reportTime = (event.target as HTMLInputElement).value; } })),
          ]),
        ]),
        h('section', { class: 'aw-card production-action-page' }, [
          h('div', { class: 'section-title' }, '本工单进度'),
          h('div', { class: 'aw-form-note production-inline-note' }, `当前来源：${isFree.value ? '自由模式，人员可按权限直接报工，不受领工/派工数量限制。' : '领工派工，报工数量受已领数量或派工数量约束。'}`),
          simpleReportTable(['序号', '产品', '工序', '来源方式', '责任人员', '计划数量', '已领/已派', '已报工', '本次报工', '累计完成', '剩余可报', '状态'], [[form.product, isFree.value ? '自由报工' : form.process, sourceMode.value, form.person, '120', isFree.value ? '-' : '80', '0', String(form.reportedQty), String(form.reportedQty), isFree.value ? '40' : '0', '生产中']]),
        ]),
        h('section', { class: 'aw-card production-action-page' }, [
          h('div', { class: 'section-title' }, '报工说明'),
          h(AwRichTextEditor, { modelValue: '', placeholder: '填写异常说明、不良原因、设备状态、交接事项等' }),
        ]),
      ],
    });
  },
});

const ProductionCreate = defineComponent({
  name: 'ProductionCreate',
  props: {
    config: { type: Object as () => ProductionConfig, required: true },
    resource: { type: String as () => ProductionResource, required: true },
  },
  emits: ['back', 'created'],
  setup(props, { emit }) {
    const form = reactive({
      subject: '',
      sourceType: props.config.sourceTypes[0],
      sourceCode: '',
      sourceName: '',
      sourceDeliveryDate: '',
      customerName: '',
      planCycle: '',
      startDate: '',
      endDate: '',
      departmentName: '生产一部',
      workshopName: '总装车间',
      lineName: '总装产线A',
      ownerName: '',
      priorityName: '普通',
      strategy: '交期优先',
      bomVersion: '',
      routeCode: '',
      processName: '总装',
      equipmentName: '装配工装A',
      plannedHours: 8,
      reportMode: '按需发料',
      supplierName: '',
      pricingSource: '',
      receiptRequirement: '分批收货，按委外单回写',
      qualityRequirement: '委外收货后强制质检',
    });
    const lines = ref<ProductionLine[]>([]);
    const detailText = ref('');
    const message = ref('');
    const submitting = ref(false);
    const showSource = ref(false);
    const showProducts = ref(false);
    const showSupplier = ref(false);
    const showPeople = ref(false);
    const showOutsourceScope = ref(false);
    const outsourceScope = ref('');
    const workProduct = ref<ProductionLine | null>(null);
    const scopedSource = ref<ProductionSource | null>(null);
    const sources = ref<ProductionSource[]>([]);
    const products = ref<ProductionPickerProduct[]>([]);
    const suppliers = ref<OutsourceSupplier[]>([]);
    const selectedSourceId = ref('');
    const selectedProductIds = ref<string[]>([]);
    const selectedSupplierId = ref('');
    const pickedPeople = ref<PersonPickerPerson[]>([]);
    const lineColumns = computed(() => (props.config.lineMode === 'outsource' ? createOutsourceColumns(outsourceScope.value) : createLineColumns(props.config.lineMode)));
    const actions: FormAction[] = [
      { key: 'draft', label: '暂存' },
      { key: 'submit', label: '确定', primary: true },
    ];
    const personDepts = computed<PersonPickerDept[]>(() => [
      {
        key: 'production',
        label: '生产中心',
        persons: [
          { id: 'SC001', name: '生产主管', role: '生产主管', phone: '13800002001', dept: '生产中心' },
          { id: 'SC002', name: '计划员王敏', role: '生产计划', phone: '13800002002', dept: '生产中心' },
          { id: 'SC003', name: '三红', role: '总装班组长', phone: '13800002003', dept: '总装车间' },
          { id: 'SC004', name: '李工', role: '焊接班组长', phone: '13800002004', dept: '焊接车间' },
        ],
      },
    ]);
    const totalQuantity = computed(() => lines.value.reduce((sum, line) => sum + Number(line.quantity || line.demandQuantity || line.planQuantity || 0), 0));
    const totalAmount = computed(() => lines.value.reduce((sum, line) => sum + Number(line.amount || 0), 0));
    const isDemand = computed(() => props.config.lineMode === 'demand');
    const isPlan = computed(() => props.config.lineMode === 'plan');
    const isOrder = computed(() => props.config.lineMode === 'order');
    const isWork = computed(() => props.config.lineMode === 'work');
    const isOutsource = computed(() => props.config.lineMode === 'outsource');
    const sourcePickerTitle = computed(() => {
      if (isPlan.value) return '选择生产计划来源';
      if (isOrder.value) return '选择生产订单来源';
      if (isOutsource.value) return '选择委外加工来源';
      return '选择来源单据';
    });
    const sourceButtonText = computed(() => '⌕');
    const subjectPlaceholder = computed(() => (isDemand.value ? `填写${props.config.subjectTitle}` : `手动输入${props.config.subjectTitle}`));
    const lineSectionTitle = computed(() => {
      if (isWork.value) return '工艺流程';
      if (isOutsource.value) return '委外明细';
      return '产品明细';
    });
    const canAddLine = computed(() => false);
    const peoplePickerTitle = computed(() => (isWork.value ? '选择派工人员/班组' : '选择负责人'));

    onMounted(async () => {
      sources.value = await listProductionSources(props.config.sourceTypes);
      products.value = await listProductionProducts();
      suppliers.value = await listOutsourceSuppliers();
      await listProductionPeople();
      if (props.config.lineMode === 'plan') products.value.slice(0, 2).forEach((product) => addProduct(product, { seeded: true, sourceType: '生产需求' }));
      if (props.config.lineMode === 'order') addProduct(products.value[0], { seeded: true, sourceType: '生产计划' });
      if (props.config.lineMode === 'outsource') {
        outsourceScope.value = '整单委外';
        products.value.slice(0, 2).forEach((product) => addProduct(product, { seeded: true, sourceType: '生产订单' }));
      }
    });

    function addProduct(product?: ProductionPickerProduct, options: { seeded?: boolean; sourceType?: string; sourceCode?: string; sourceLine?: string } = {}) {
      if (!product) return;
      const line = lineFromProduct(product, options);
      if (props.config.lineMode === 'work') {
        workProduct.value = line;
        form.subject = form.subject || `${line.productName}${line.processName || '工序'}工单`;
        form.bomVersion = line.bomVersion || '';
        form.routeCode = line.routeCode || '';
        lines.value = createProcessRows(line);
        return;
      }
      if (props.config.lineMode === 'demand') line.demandQuantity = line.quantity;
      if (props.config.lineMode === 'plan') {
        line.sourceType = line.sourceType || '生产需求';
        line.demandQuantity = line.quantity;
        line.planQuantity = line.quantity;
      }
      if (props.config.lineMode === 'outsource') {
        line.sourceType = line.sourceType || '生产订单';
        line.sourceQuantity = line.quantity;
        line.outsourceQuantity = line.quantity;
      }
      line.amount = Number(line.price || 0) * Number(line.quantity || 0);
      line.ownerName = form.ownerName || '';
      line.equipmentName = form.equipmentName;
      line.plannedHours = Number(form.plannedHours || 0);
      line.reportMode = form.reportMode;
      lines.value.push(line);
    }

    function confirmSource(id?: string) {
      const picked = sources.value.find((row) => row.id === (id || selectedSourceId.value)) || sources.value[0];
      if (!picked) return;
      form.sourceType = picked.type;
      form.sourceCode = picked.code;
      form.sourceName = picked.title;
      form.customerName = picked.customerName || picked.subjectName;
      form.subject = `${picked.title.replace(/(需求|计划|订单|工单)$/, '')}${props.config.title}`;
      form.sourceDeliveryDate = picked.deliveryDate;
      form.bomVersion = picked.productRef.bomVersion || '';
      form.routeCode = picked.productRef.routeCode || '';
      const productLine = {
        ...lineFromProduct({
          id: picked.productRef.id,
          productCode: picked.productRef.productCode,
          productName: picked.productRef.productName,
          model: picked.productRef.model,
          unit: picked.productRef.unit,
          bomVersion: picked.productRef.bomVersion || '',
          bomLock: picked.productRef.bomLock || '',
          routeCode: picked.productRef.routeCode || '',
          routeLock: picked.productRef.routeLock || '',
          processName: picked.productRef.processName || '',
          price: picked.productRef.price || 0,
          quantity: Number(picked.productRef.quantity || picked.quantity || 0),
          deliveryDate: picked.deliveryDate,
          reportedQuantity: picked.productRef.completedQuantity,
          goodQuantity: picked.productRef.goodQuantity,
          badQuantity: picked.productRef.badQuantity,
          inboundQuantity: picked.productRef.inboundQuantity,
        }, { seeded: true, sourceType: picked.type, sourceCode: picked.code, sourceLine: picked.productRef.sourceLine || `${picked.code}-01` }),
        id: `line_${Date.now()}`,
        sourceType: picked.type,
        sourceCode: picked.code,
        sourceLine: picked.productRef.sourceLine || `${picked.code}-01`,
        quantity: Number(picked.productRef.quantity || picked.quantity || 0),
        demandQuantity: Number(picked.productRef.quantity || picked.quantity || 0),
        planQuantity: Number(picked.productRef.quantity || picked.quantity || 0),
        sourceQuantity: Number(picked.productRef.quantity || picked.quantity || 0),
        outsourceQuantity: Number(picked.productRef.quantity || picked.quantity || 0),
        deliveryDate: picked.deliveryDate,
        endDate: picked.deliveryDate,
      };
      if (props.config.lineMode === 'outsource') {
        scopedSource.value = picked;
        outsourceScope.value = '';
        lines.value = [];
        showSource.value = false;
        showOutsourceScope.value = true;
        return;
      }
      lines.value = props.config.lineMode === 'order'
        ? [productLine]
        : [productLine, { ...lineFromProduct(products.value[1] || products.value[0], { seeded: true, sourceType: picked.type, sourceCode: picked.code, sourceLine: `${picked.code}-02` }), id: `line_${Date.now()}_extra`, deliveryDate: picked.deliveryDate, endDate: picked.deliveryDate }];
      showSource.value = false;
    }

    function confirmProducts() {
      const picked = products.value.filter((row) => selectedProductIds.value.includes(row.id));
      (picked.length ? picked : props.config.lineMode === 'work' ? products.value.slice(0, 1) : []).forEach((product) => addProduct(product));
      selectedProductIds.value = [];
      showProducts.value = false;
    }

    function confirmSupplier(id?: string) {
      const picked = suppliers.value.find((row) => row.id === (id || selectedSupplierId.value)) || suppliers.value[0];
      if (!picked) return;
      form.supplierName = picked.name;
      showSupplier.value = false;
    }

    function confirmPeople(people: PersonPickerPerson[]) {
      pickedPeople.value = people.slice(0, 1);
      form.ownerName = pickedPeople.value[0]?.name || form.ownerName;
      lines.value = lines.value.map((line) => ({ ...line, ownerName: form.ownerName }));
      showPeople.value = false;
    }

    function confirmOutsourceScope(payload: string | { scope: string; rows?: ProductionLine[] }) {
      const scope = typeof payload === 'string' ? payload : payload.scope;
      const pickedRows = typeof payload === 'string' ? [] : (payload.rows || []);
      const source = scopedSource.value;
      if (!source) {
        showOutsourceScope.value = false;
        return;
      }
      const productLine = {
        ...lineFromProduct({
          id: source.productRef.id,
          productCode: source.productRef.productCode,
          productName: source.productRef.productName,
          model: source.productRef.model,
          unit: source.productRef.unit,
          bomVersion: source.productRef.bomVersion || '',
          bomLock: source.productRef.bomLock || '',
          routeCode: source.productRef.routeCode || '',
          routeLock: source.productRef.routeLock || '',
          processName: source.productRef.processName || '',
          price: source.productRef.price || 0,
          quantity: Number(source.productRef.quantity || source.quantity || 0),
          deliveryDate: source.deliveryDate,
          reportedQuantity: source.productRef.completedQuantity,
          goodQuantity: source.productRef.goodQuantity,
          badQuantity: source.productRef.badQuantity,
          inboundQuantity: source.productRef.inboundQuantity,
        }),
        sourceType: source.type,
        sourceCode: source.code,
        sourceLine: source.productRef.sourceLine || `${source.code}-01`,
        quantity: Number(source.productRef.quantity || source.quantity || 0),
        sourceQuantity: Number(source.productRef.quantity || source.quantity || 0),
        outsourceQuantity: Number(source.productRef.quantity || source.quantity || 0),
        deliveryDate: source.deliveryDate,
        endDate: source.deliveryDate,
      };
      outsourceScope.value = scope;
      if (scope === '工序委外') {
        const processRows = pickedRows.length ? pickedRows : createProcessRows(productLine);
        lines.value = processRows.map((step, index) => ({
          ...productLine,
          id: `${productLine.sourceCode}_${step.processSeq}_${index}`,
          processSeq: step.processSeq,
          processName: step.processName,
          processType: step.processType,
          stationName: step.stationName,
          sourceQuantity: step.planQuantity || productLine.quantity,
          outsourceQuantity: step.planQuantity || productLine.quantity,
          deliveryDate: source.deliveryDate,
          remark: step.standard,
        }));
      } else {
        lines.value = [{
          ...productLine,
          id: `${productLine.sourceCode}_whole`,
          sourceLine: `${source.code}-整单`,
          remark: '整单委外加工',
        }];
      }
      showOutsourceScope.value = false;
    }

    function setAllDispatchMode(mode: string) {
      lines.value = lines.value.map((line) => ({ ...line, dispatchMode: mode }));
      message.value = `工艺流程已切换为${mode}`;
    }

    function removeLine(id: string) {
      lines.value = lines.value.filter((line) => line.id !== id);
    }

    function recalc(row: ProductionLine) {
      const quantity = Number(props.config.lineMode === 'demand'
        ? (row.demandQuantity || row.quantity || 0)
        : props.config.lineMode === 'plan'
          ? (row.planQuantity || row.quantity || 0)
          : props.config.lineMode === 'outsource'
            ? (row.outsourceQuantity || row.quantity || 0)
            : props.config.lineMode === 'work'
              ? (row.planQuantity || row.quantity || 0)
              : (row.quantity || 0));
      row.quantity = quantity;
      if (props.config.lineMode === 'demand') row.demandQuantity = quantity;
      if (props.config.lineMode === 'plan') row.planQuantity = quantity;
      if (props.config.lineMode === 'outsource') row.outsourceQuantity = quantity;
      row.amount = Number(row.price || 0) * quantity;
    }

    function reset() {
      form.subject = '';
      form.sourceCode = '';
      form.sourceName = '';
      form.sourceDeliveryDate = '';
      form.customerName = '';
      form.ownerName = pickedPeople.value[0]?.name || '';
      outsourceScope.value = '';
      scopedSource.value = null;
      workProduct.value = null;
      lines.value = [];
      detailText.value = '';
      message.value = '已重置';
    }

    async function handleAction(key: string) {
      if (key === 'reset') {
        reset();
        return;
      }
      if (submitting.value) return;
      if (!lines.value.length) {
        message.value = '提交失败：请先添加产品明细';
        return;
      }
      submitting.value = true;
      const quantity = totalQuantity.value || Number(lines.value[0]?.quantity || 0);
      await createProduction(props.resource, {
        subject: form.subject || props.config.createLabel,
        code: '系统自动生成',
        sourceType: form.sourceType,
        sourceCode: form.sourceCode || '手动创建',
        sourceName: form.sourceName,
        sourceDeliveryDate: form.sourceDeliveryDate,
        customerName: form.customerName,
        productName: workProduct.value?.productName || lines.value[0]?.productName || '未选择产品',
        quantity,
        doneQuantity: 0,
        startDate: form.startDate,
        endDate: form.endDate,
        departmentName: form.departmentName,
        workshopName: form.workshopName,
        lineName: form.lineName,
        ownerName: isOutsource.value ? (form.supplierName || '委外加工商') : (form.ownerName || '生产主管'),
        priorityName: form.priorityName,
        bomVersion: form.bomVersion || lines.value[0]?.bomVersion,
        routeCode: form.routeCode || lines.value[0]?.routeCode,
        supplierName: form.supplierName,
        pricingSource: form.pricingSource,
        receiptRequirement: form.receiptRequirement,
        qualityRequirement: form.qualityRequirement,
        status: key === 'draft' ? 'draft' : 'pendingApproval',
        statusName: key === 'draft' ? '草稿' : '待审批',
        detailText: detailText.value,
        lines: isOrder.value ? buildWorkOrderLines(lines.value[0]) : lines.value,
      });
      submitting.value = false;
      emit('created', key === 'draft' ? `${props.config.title}草稿已通过 create API 保存` : `${props.config.title}已通过 create API 提交`);
    }

    function cellEditor(column: EditableColumn, row: ProductionLine) {
      const key = column.key as keyof ProductionLine;
      if (props.config.lineMode === 'demand' && column.key === 'sourceType') {
        return select(row.sourceType || '手动需求', ['手动需求', '销售订单', '库存备货', '研发试制'], (value) => { row.sourceType = value; });
      }
      if (props.config.lineMode !== 'demand' && column.key === 'sourceType') {
        return h('span', String(row.sourceType ?? '-'));
      }
      if ((props.config.lineMode === 'plan' && column.key === 'demandQuantity') || (props.config.lineMode === 'order' && column.key === 'processName')) {
        return h('span', String(row[key] ?? '-'));
      }
      if (['sourceCode', 'sourceLine', 'productCode', 'productName', 'model', 'unit', 'processSeq', 'processType', 'stationName', 'standard', 'workCode', 'workType', 'workName', 'itemName', 'completedQuantity', 'goodQuantity', 'badQuantity', 'ownerName', 'qmsStatus', 'statusName', 'sourceQuantity'].includes(column.key)) {
        return h('span', String(row[key] ?? '-'));
      }
      if (column.key === 'bomVersion') {
        return h('select', { class: 'aw-select', value: row.bomVersion || 'BOM-V3.2', onChange: (event: Event) => { row.bomVersion = (event.target as HTMLSelectElement).value; } }, ['BOM-V3.2', 'BOM-V2.1', 'BOM-V1.8', '默认BOM'].map((item) => h('option', item)));
      }
      if (column.key === 'bomLock') {
        return h('select', { class: 'aw-select', value: row.bomLock || '待锁版', onChange: (event: Event) => { row.bomLock = (event.target as HTMLSelectElement).value; } }, ['待锁版', '已锁版', '无需锁版'].map((item) => h('option', item)));
      }
      if (column.key === 'routeCode') {
        return h('select', { class: 'aw-select', value: row.routeCode || '默认工艺路线', onChange: (event: Event) => { row.routeCode = (event.target as HTMLSelectElement).value; } }, ['默认工艺路线', 'RT-总装-01', 'RT-焊接-02', 'RT-机加工-01'].map((item) => h('option', item)));
      }
      if (column.key === 'routeLock') {
        return h('select', { class: 'aw-select', value: row.routeLock || '待锁版', onChange: (event: Event) => { row.routeLock = (event.target as HTMLSelectElement).value; } }, ['待锁版', '已锁版', '无需锁版'].map((item) => h('option', item)));
      }
      if (column.key === 'processName') {
        return h('select', { class: 'aw-select', value: row.processName || '总装', onChange: (event: Event) => { row.processName = (event.target as HTMLSelectElement).value; } }, ['备料', '焊接', '机加工', '总装', '包装', '表面处理'].map((item) => h('option', item)));
      }
      if (column.key === 'dispatchMode') {
        return h('select', { class: 'aw-select', value: row.dispatchMode || '领工模式', onChange: (event: Event) => { row.dispatchMode = (event.target as HTMLSelectElement).value; message.value = row.dispatchMode === '派工模式' ? `${row.processName || '工序'}已切换为派工模式，可继续选择派工人员。` : `${row.processName || '工序'}已切换为${row.dispatchMode}`; } }, ['领工模式', '派工模式', '自由模式'].map((item) => h('option', item)));
      }
      if (column.key === 'reportMode') {
        return h('select', { class: 'aw-select', value: row.reportMode || '按产量报工', onChange: (event: Event) => { row.reportMode = (event.target as HTMLSelectElement).value; } }, ['按产量报工', '按工时报工', '按产量+工时报工'].map((item) => h('option', item)));
      }
      return h('input', {
        class: 'aw-input',
        value: String(row[key] ?? ''),
        onInput: (event: Event) => {
          const value = (event.target as HTMLInputElement).value;
          if (['quantity', 'demandQuantity', 'planQuantity', 'outsourceQuantity', 'price', 'plannedHours', 'amount', 'cost'].includes(column.key)) (row as any)[column.key] = value === '' ? '' : Number(value || 0);
          else (row as any)[column.key] = value;
          recalc(row);
        },
      });
    }

    return () => h(AwFormPage, { actions, backText: '关闭', onBack: () => emit('back'), onAction: handleAction }, {
      default: () => [
        h('section', { class: 'aw-form-card' }, [
          h('div', { class: 'aw-detail-section-title' }, '基础信息'),
          h('div', { class: 'aw-form-grid' }, [
            field(props.config.subjectTitle, isPlan.value || isOrder.value || isOutsource.value ? h('div', { class: 'aw-field-row' }, [
              h('input', { class: 'aw-input', value: form.subject, placeholder: subjectPlaceholder.value, onInput: (event: Event) => { form.subject = (event.target as HTMLInputElement).value; } }),
              h('button', { class: 'aw-tool-btn', title: '选择来源', type: 'button', onClick: () => { selectedSourceId.value = ''; showSource.value = true; } }, sourceButtonText.value),
            ]) : h('input', { class: 'aw-input', value: form.subject, placeholder: subjectPlaceholder.value, onInput: (event: Event) => { form.subject = (event.target as HTMLInputElement).value; } }), true),
            field(props.config.codeTitle, h('input', { class: 'aw-input', value: '自动生成', disabled: true })),
            isPlan.value || isOrder.value ? field('生产来源', h('input', { class: 'aw-input', value: form.sourceCode ? `${form.sourceType} / ${form.sourceCode}` : '手动输入', readonly: true }), true) : null,
            isPlan.value || isOrder.value || isOutsource.value ? field('来源主体', h('input', { class: 'aw-input', value: form.customerName || '手动输入后提交时选择责任主体', readonly: true })) : null,
            isPlan.value || isOrder.value || isOutsource.value ? field('来源交付日期', h('input', { class: 'aw-input', value: form.sourceDeliveryDate, readonly: true, placeholder: '选择来源后自动带入交付日期' })) : null,
            isDemand.value || isOrder.value ? field(props.config.statusTitle, h('input', { class: 'aw-input', value: isDemand.value ? '待确认' : '待生产', readonly: true })) : null,
            !isOutsource.value ? field('生产部门', select(form.departmentName, ['生产一部', '装配车间', '委外管理组'], (value) => { form.departmentName = value; }), true) : null,
            !isOutsource.value ? field('负责人', h('div', { class: 'aw-field-row' }, [
              h('input', { class: 'aw-input', value: form.ownerName, readonly: true, placeholder: '选择生产负责人' }),
              h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => { showPeople.value = true; } }, '选择'),
            ]), true) : null,
            !isOutsource.value ? field('计划开始日期', h('input', { class: 'aw-input', value: form.startDate, placeholder: '选择计划开始日期', onInput: (event: Event) => { form.startDate = (event.target as HTMLInputElement).value; } }), true) : null,
            !isOutsource.value ? field('计划完成日期', h('input', { class: 'aw-input', value: form.endDate, placeholder: '选择计划完成日期', onInput: (event: Event) => { form.endDate = (event.target as HTMLInputElement).value; } }), true) : null,
            field('优先级', select(form.priorityName, ['普通', '紧急', '特急'], (value) => { form.priorityName = value; })),
            isWork.value ? field('选择产品', h('div', { class: 'aw-field-row' }, [
              h('input', { class: 'aw-input', value: workProduct.value ? `${workProduct.value.productName} / ${workProduct.value.productCode}` : '', readonly: true, placeholder: '点击右侧按钮选择产品' }),
              h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => { selectedProductIds.value = []; showProducts.value = true; } }, '选择'),
            ]), true) : null,
            isOutsource.value ? field('委外方式', h('input', { class: 'aw-input', value: outsourceScope.value || '选择来源后确定', readonly: true })) : null,
            isOutsource.value ? field('委外加工商', h('div', { class: 'aw-field-row' }, [
              h('input', { class: 'aw-input', value: form.supplierName, readonly: true, placeholder: '选择委外加工供应商' }),
              h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => { selectedSupplierId.value = suppliers.value[0]?.id || ''; showSupplier.value = true; } }, '选择'),
            ]), true) : null,
            isOutsource.value ? field('发料方式', select(form.reportMode, ['按需发料', '整批发料', '委外商提供'], (value) => { form.reportMode = value; })) : null,
            isOrder.value ? field('生产产品', h('input', { class: 'aw-input', value: lines.value[0]?.productName || '', readonly: true }), true) : null,
            isOrder.value ? field('生产数量', h('input', { class: 'aw-input', value: String(lines.value[0]?.quantity || ''), onInput: (event: Event) => { if (lines.value[0]) { lines.value[0].quantity = Number((event.target as HTMLInputElement).value || 0); lines.value[0].planQuantity = lines.value[0].quantity; } } }), true) : null,
          ]),
          message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
        ]),
        h('section', { class: 'aw-form-card' }, [
          h('div', { class: 'aw-detail-section-title' }, isOrder.value ? '工单明细' : lineSectionTitle.value),
          isOrder.value ? h('div', { class: 'aw-form-note production-inline-note' }, '生产订单只承接一个产品；工单明细用于拆分该产品下的半成品工单、关键工序工单和成品总装工单。') : null,
          isWork.value && lines.value.length ? h('div', { class: 'production-dispatch-modes' }, ['领工模式', '派工模式', '自由模式'].map((mode) => h('button', { class: ['aw-tool-btn', { on: lines.value.every((line) => line.dispatchMode === mode) }], type: 'button', onClick: () => setAllDispatchMode(mode) }, mode))) : null,
          h(AwEditableSubTable, { columns: lineColumns.value, rows: (isOrder.value ? buildWorkOrderLines(lines.value[0]) : lines.value) as any, addText: '+ 新增明细', showAdd: canAddLine.value, actionWidth: 80, onAdd: () => { selectedProductIds.value = []; showProducts.value = true; } }, isWork.value ? {
            cell: ({ column, row }: { column: EditableColumn; row: ProductionLine }) => cellEditor(column, row),
          } : {
            cell: ({ column, row }: { column: EditableColumn; row: ProductionLine }) => cellEditor(column, row),
            actions: ({ row }: { row: ProductionLine }) => isOrder.value ? h('span', { class: 'aw-link' }, '查看') : h('span', { class: 'aw-link danger', onClick: () => removeLine(row.id) }, '删除'),
          }),
          (isDemand.value || isPlan.value) ? h('div', { class: 'production-add-detail' }, [
            h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => { selectedProductIds.value = []; showProducts.value = true; } }, '+ 新增明细'),
            h('span', '选择产品后自动带入产品编号、名称、规格、单位等信息'),
          ]) : null,
          h('div', { class: 'aw-line-total' }, [
            h('span', '合计'),
            h('span', ['总数量：', h('strong', String(totalQuantity.value))]),
            props.config.lineMode === 'outsource' ? h('span', ['委外金额：', h('strong', totalAmount.value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))]) : null,
          ]),
        ]),
        h('section', { class: 'aw-form-card' }, [
          h('div', { class: 'aw-detail-section-title' }, '附件'),
          h('div', { class: 'aw-upload-card' }, [h('span', { class: 'aw-link' }, '点击上传'), ' / 拖拽到此区域，支持图纸、工艺卡、生产说明、委外协议等附件']),
        ]),
        h('section', { class: 'aw-form-card' }, [
          h('div', { class: 'aw-detail-section-title' }, '详情'),
          h(AwRichTextEditor, { modelValue: detailText.value, placeholder: '填写生产要求、工艺说明、齐套要求、交付约束和异常处理规则', 'onUpdate:modelValue': (value: string) => { detailText.value = value; } }),
        ]),
        h(SourcePickerModal, { open: showSource.value, title: sourcePickerTitle.value, sourceTypes: props.config.sourceTypes, rows: sources.value, selectedId: selectedSourceId.value, onSelect: (id: string) => { selectedSourceId.value = id; }, onCancel: () => { showSource.value = false; }, onConfirm: confirmSource }),
        h(ProductPickerModal, { open: showProducts.value, rows: products.value, selectedIds: selectedProductIds.value, multi: !isWork.value, onSelect: (id: string) => { selectedProductIds.value = isWork.value ? [id] : selectedProductIds.value.includes(id) ? selectedProductIds.value.filter((item) => item !== id) : [...selectedProductIds.value, id]; }, onCancel: () => { showProducts.value = false; }, onConfirm: confirmProducts }),
        h(SupplierPickerModal, { open: showSupplier.value, rows: suppliers.value, selectedId: selectedSupplierId.value, onSelect: (id: string) => { selectedSupplierId.value = id; }, onCancel: () => { showSupplier.value = false; }, onConfirm: confirmSupplier }),
        h(OutsourceScopeModal, { open: showOutsourceScope.value, source: scopedSource.value, scope: outsourceScope.value, onCancel: () => { showOutsourceScope.value = false; }, onConfirm: confirmOutsourceScope }),
        h(AwPersonPickerModal, { open: showPeople.value, title: peoplePickerTitle.value, depts: personDepts.value, picked: pickedPeople.value, onCancel: () => { showPeople.value = false; }, onConfirm: confirmPeople }),
      ],
    });
  },
});

const SourcePickerModal = defineComponent({
  name: 'SourcePickerModal',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
    sourceTypes: { type: Array as () => string[], required: true },
    rows: { type: Array as () => ProductionSource[], required: true },
    selectedId: { type: String, default: '' },
  },
  emits: ['select', 'cancel', 'confirm'],
  setup(props, { emit }) {
    const active = ref(props.sourceTypes[0] || '');
    const keyword = ref('');
    watch(() => props.sourceTypes.join('|'), () => { active.value = props.sourceTypes[0] || ''; });
    const filteredRows = computed(() => props.rows.filter((row) => {
      const text = keyword.value.trim();
      return row.type === active.value && (!text || [row.code, row.title, row.subjectName, row.customerName, row.productName].some((value) => value?.includes(text)));
    }));
    const checkedId = computed(() => filteredRows.value.some((row) => row.id === props.selectedId) ? props.selectedId : filteredRows.value[0]?.id || '');
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', props.title),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'production-source-picker' }, [
            h('div', { class: 'production-source-types' }, props.sourceTypes.map((type) => h('div', {
              class: ['aw-tree-row', 'aw-tree-l2', { on: active.value === type }],
              onClick: () => { active.value = type; emit('select', ''); },
            }, [h('span', { class: 'aw-tree-caret' }, active.value === type ? '▾' : ''), h('span', `${type}列表`)]))),
            h('div', { class: 'production-source-list' }, [
              h('div', { class: 'production-picker-toolbar' }, [
                h('input', { class: 'aw-input', value: keyword.value, placeholder: '搜索单据编号 / 主题 / 产品', onInput: (event: Event) => { keyword.value = (event.target as HTMLInputElement).value; } }),
                h('span', `共 ${filteredRows.value.length} 条`),
              ]),
              h('div', { class: 'aw-doc-tbl-inner' }, [
                h('table', { class: 'aw-doc-tbl' }, [
                  h('thead', [h('tr', ['', '序号', '单据编号', '单据主题', '主体', '产品', '数量', '交付日期'].map((title) => title ? h('th', [h('div', { class: 'aw-th-inner' }, title)]) : h('th', { style: { width: '46px' } }, '')))]),
                  h('tbody', filteredRows.value.map((row, index) => {
                    const checked = checkedId.value === row.id;
                    return h('tr', { key: row.id, style: checked ? { background: 'var(--aw-primary-soft)' } : undefined, onClick: () => emit('select', row.id) }, [
                      h('td', [h('input', { type: 'radio', checked })]),
                      h('td', String(index + 1)),
                      h('td', { class: 'aw-num' }, row.code),
                      h('td', row.title),
                      h('td', row.customerName || row.subjectName),
                      h('td', row.productName),
                      h('td', String(row.quantity)),
                      h('td', row.deliveryDate),
                    ]);
                  })),
                ]),
              ]),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', checkedId.value) }, '确定'),
        ]),
      ]),
    ]) : null;
  },
});

const OutsourceScopeModal = defineComponent({
  name: 'OutsourceScopeModal',
  props: {
    open: { type: Boolean, required: true },
    source: { type: Object as () => ProductionSource | null, default: null },
    scope: { type: String, default: '' },
  },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const pickedScope = ref(props.scope || '整单委外');
    const selectedIndexes = ref<number[]>([0]);
    watch(() => props.open, () => {
      pickedScope.value = props.scope || '整单委外';
      selectedIndexes.value = [0];
    });
    const previewRows = computed(() => {
      if (!props.source) return [];
      if (props.source.type === '生产订单') {
        return buildWorkOrderLines(props.source.productRef).map((row, index) => ({
          ...row,
          id: `${row.id}_scope_${index}`,
          processSeq: row.workCode,
          processName: row.workName,
          processType: row.workType,
          planQuantity: row.quantity,
          standard: `${row.workName}按工艺要求执行`,
        }));
      }
      return createProcessRows(props.source.productRef).slice(0, 4);
    });
    function toggleRow(index: number) {
      if (pickedScope.value === '整单委外') return;
      selectedIndexes.value = selectedIndexes.value.includes(index)
        ? selectedIndexes.value.filter((item) => item !== index)
        : [...selectedIndexes.value, index];
      if (!selectedIndexes.value.length) selectedIndexes.value = [index];
    }
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', '选择委外范围'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'production-scope-radios' }, ['整单委外', '工序委外'].map((scope) => h('label', [
            h('input', { type: 'radio', checked: pickedScope.value === scope, onChange: () => { pickedScope.value = scope; selectedIndexes.value = [0]; } }),
            h('span', scope),
          ]))),
          h('div', { class: 'aw-form-grid production-scope-info' }, [
            field('来源单据', h('input', { class: 'aw-input', value: props.source?.code || '', readonly: true })),
            field('来源产品', h('input', { class: 'aw-input', value: props.source ? `${props.source.productName} / ${props.source.productRef.productCode}` : '', readonly: true })),
            field('来源数量', h('input', { class: 'aw-input', value: String(props.source?.quantity || ''), readonly: true })),
          ]),
          h('div', { class: 'aw-doc-tbl-inner' }, [
            h('table', { class: 'aw-doc-tbl' }, [
              h('thead', [h('tr', ['选择', '序号', '子件/工序编号', '子件/工序名称', '类型', '工位/产线', '数量', '作业说明', '负责人', '状态'].map((title) => h('th', [h('div', { class: 'aw-th-inner' }, title)])))]),
              h('tbody', previewRows.value.map((row, index) => {
                const checked = pickedScope.value === '整单委外' || selectedIndexes.value.includes(index);
                return h('tr', { key: row.id, style: checked ? { background: 'var(--aw-primary-soft)' } : undefined, onClick: () => toggleRow(index) }, [
                h('td', [h('input', { type: 'checkbox', checked, disabled: pickedScope.value === '整单委外', onChange: () => toggleRow(index) })]),
                h('td', String(index + 1)),
                h('td', row.processSeq || '-'),
                h('td', row.processName || '-'),
                h('td', row.processType || '-'),
                h('td', row.stationName || '-'),
                h('td', String(row.planQuantity || row.quantity || 0)),
                h('td', row.standard || '-'),
                h('td', row.ownerName || '-'),
                h('td', row.statusName || '-'),
              ]);
              })),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', {
            scope: pickedScope.value,
            rows: pickedScope.value === '整单委外' ? previewRows.value : previewRows.value.filter((_, index) => selectedIndexes.value.includes(index)),
          }) }, '确定'),
        ]),
      ]),
    ]) : null;
  },
});

const ProductPickerModal = defineComponent({
  name: 'ProductPickerModal',
  props: {
    open: { type: Boolean, required: true },
    rows: { type: Array as () => ProductionPickerProduct[], required: true },
    selectedIds: { type: Array as () => string[], default: () => [] },
    multi: { type: Boolean, default: true },
  },
  emits: ['select', 'cancel', 'confirm'],
  setup(props, { emit }) {
    const keyword = ref('');
    const activeCategory = ref('全部');
    const categories = computed(() => ['全部', ...Array.from(new Set(props.rows.map((row) => row.categoryName || '未分类')))]);
    const filteredRows = computed(() => props.rows.filter((row) => {
      const text = keyword.value.trim();
      const categoryMatched = activeCategory.value === '全部' || (row.categoryName || '未分类') === activeCategory.value;
      const keywordMatched = !text || [row.productCode, row.productName, row.model, row.categoryName, row.supplier].some((value) => value?.includes(text));
      return categoryMatched && keywordMatched;
    }));
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', '选择产品'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'production-product-picker' }, [
            h('div', { class: 'production-source-types' }, categories.value.map((category) => h('div', {
              class: ['aw-tree-row', 'aw-tree-l2', { on: activeCategory.value === category }],
              onClick: () => { activeCategory.value = category; },
            }, [h('span', { class: 'aw-tree-caret' }, activeCategory.value === category ? '▾' : ''), h('span', category)]))),
            h('div', { class: 'production-source-list' }, [
              h('div', { class: 'production-picker-toolbar' }, [
                h('input', { class: 'aw-input', value: keyword.value, placeholder: '搜索产品编号 / 名称 / 型号', onInput: (event: Event) => { keyword.value = (event.target as HTMLInputElement).value; } }),
                h('span', `已选 ${props.selectedIds.length} 项 / 共 ${filteredRows.value.length} 条`),
              ]),
              h('div', { class: 'aw-doc-tbl-inner' }, [
                h('table', { class: 'aw-doc-tbl' }, [
                  h('thead', [h('tr', ['选择', '序号', '产品编号', '产品名称', '产品型号', '产品分类', '单位', '参考单价', '库存', '默认供应商'].map((title) => h('th', [h('div', { class: 'aw-th-inner' }, title)])))]),
                  h('tbody', filteredRows.value.map((row, index) => {
                    const picked = props.selectedIds.includes(row.id);
                    return h('tr', { key: row.id, style: picked ? { background: 'var(--aw-primary-soft)' } : undefined, onClick: () => emit('select', row.id) }, [
                      h('td', [h('input', { type: props.multi ? 'checkbox' : 'radio', checked: picked })]),
                      h('td', String(index + 1)),
                      h('td', { class: 'aw-num' }, row.productCode),
                      h('td', row.productName),
                      h('td', row.model),
                      h('td', row.categoryName || '-'),
                      h('td', row.unit),
                      h('td', Number(row.price || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                      h('td', String(row.stock ?? '-')),
                      h('td', row.supplier || '-'),
                    ]);
                  })),
                ]),
              ]),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm') }, '确定'),
        ]),
      ]),
    ]) : null;
  },
});

const SupplierPickerModal = defineComponent({
  name: 'SupplierPickerModal',
  props: {
    open: { type: Boolean, required: true },
    rows: { type: Array as () => OutsourceSupplier[], required: true },
    selectedId: { type: String, default: '' },
  },
  emits: ['select', 'cancel', 'confirm'],
  setup(props, { emit }) {
    const keyword = ref('');
    const activeGroup = ref('全部');
    const groups = computed(() => ['全部', ...Array.from(new Set(props.rows.map((row) => row.group || '未分组')))]);
    const filteredRows = computed(() => props.rows.filter((row) => {
      const text = keyword.value.trim();
      const groupMatched = activeGroup.value === '全部' || (row.group || '未分组') === activeGroup.value;
      const keywordMatched = !text || [row.name, row.group, row.contact, row.phone, row.status].some((value) => value?.includes(text));
      return groupMatched && keywordMatched;
    }));
    const checkedId = computed(() => filteredRows.value.some((row) => row.id === props.selectedId) ? props.selectedId : filteredRows.value[0]?.id || '');
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal lg', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [
          h('span', '选择委外加工商'),
          h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('cancel') }, '×'),
        ]),
        h('div', { class: 'body' }, [
          h('div', { class: 'production-product-picker' }, [
            h('div', { class: 'production-source-types' }, groups.value.map((group) => h('div', {
              class: ['aw-tree-row', 'aw-tree-l2', { on: activeGroup.value === group }],
              onClick: () => { activeGroup.value = group; emit('select', ''); },
            }, [h('span', { class: 'aw-tree-caret' }, activeGroup.value === group ? '▾' : ''), h('span', group)]))),
            h('div', { class: 'production-source-list' }, [
              h('div', { class: 'production-picker-toolbar' }, [
                h('input', { class: 'aw-input', value: keyword.value, placeholder: '搜索供应商 / 联系人 / 电话', onInput: (event: Event) => { keyword.value = (event.target as HTMLInputElement).value; } }),
                h('span', `共 ${filteredRows.value.length} 条`),
              ]),
              h('div', { class: 'aw-doc-tbl-inner' }, [
                h('table', { class: 'aw-doc-tbl' }, [
                  h('thead', [h('tr', ['选择', '供应商名称', '分组', '联系人', '联系方式', '状态'].map((title) => h('th', [h('div', { class: 'aw-th-inner' }, title)])))]),
                  h('tbody', filteredRows.value.map((row) => {
                    const picked = checkedId.value === row.id;
                    return h('tr', { key: row.id, style: picked ? { background: 'var(--aw-primary-soft)' } : undefined, onClick: () => emit('select', row.id) }, [
                      h('td', [h('input', { type: 'radio', checked: picked })]),
                      h('td', row.name),
                      h('td', row.group || '-'),
                      h('td', row.contact),
                      h('td', row.phone),
                      h('td', row.status || '-'),
                    ]);
                  })),
                ]),
              ]),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('cancel') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', checkedId.value) }, '确定'),
        ]),
      ]),
    ]) : null;
  },
});

function field(label: string, content: unknown, required = false) {
  if (!content) return null;
  return h('div', { class: 'aw-field' }, [h('label', { class: { req: required } }, label), content as any]);
}

function select(value: string, options: string[], onChange: (value: string) => void) {
  return h('select', { class: 'aw-select', value, onChange: (event: Event) => onChange((event.target as HTMLSelectElement).value) }, options.map((option) => h('option', { value: option }, option)));
}

</script>

<style scoped>
.production-list-message {
  margin: 0 0 10px;
}

.production-progress {
  display: inline-block;
  width: 76px;
  height: 6px;
  margin-right: 8px;
  overflow: hidden;
  vertical-align: middle;
  border-radius: 999px;
  background: var(--aw-surface-3);
}

.production-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--aw-primary);
}

.production-inline-note {
  margin: -4px 0 12px;
}

.production-source-picker {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  min-height: 420px;
}

.production-product-picker {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  min-height: 420px;
}

.production-source-types {
  padding: 8px;
  border-right: 1px solid var(--aw-border);
  background: var(--aw-surface-2);
}

.production-source-list {
  min-width: 0;
  padding-left: 14px;
}

.production-picker-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.production-picker-toolbar .aw-input {
  max-width: 320px;
}

.production-add-detail {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 12px;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.production-dispatch-modes {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin: -4px 0 12px;
}

.production-dispatch-modes .on {
  color: var(--aw-primary);
  border-color: var(--aw-primary);
}

.production-scope-radios {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 14px;
  font-size: 13px;
}

.production-scope-radios label {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.production-scope-info {
  margin-bottom: 14px;
}

:global(.production-mrp-modal) {
  width: min(1240px, calc(100vw - 40px));
  height: min(736px, calc(100vh - 32px));
  max-height: calc(100vh - 32px);
}

:global(.production-mrp-modal .body) {
  flex: 1;
  min-height: 0;
  padding: 16px 20px;
}

:global(.production-mrp-picker-modal) {
  width: min(1040px, calc(100vw - 56px));
}

:global(.production-mrp-modal .aw-chk),
:global(.production-mrp-picker-modal .aw-chk) {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: middle;
  border: 1px solid var(--aw-border-strong);
  border-radius: 3px;
  background: #fff;
}

:global(.production-mrp-modal .aw-chk.on),
:global(.production-mrp-picker-modal .aw-chk.on) {
  position: relative;
  border-color: var(--aw-primary);
  background: var(--aw-primary);
}

:global(.production-mrp-modal .aw-chk.on::after),
:global(.production-mrp-picker-modal .aw-chk.on::after) {
  position: absolute;
  left: 3px;
  top: 0;
  width: 5px;
  height: 9px;
  content: "";
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

:global(.production-mrp-modal .aw-help-tip) {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 8px;
  font-size: 12px;
  color: var(--aw-primary);
  border: 1px solid var(--aw-primary);
  border-radius: 50%;
}

:global(.production-mrp-modal .aw-help-pop) {
  position: absolute;
  left: 0;
  top: 24px;
  z-index: 3;
  display: none;
  padding: 10px;
  color: var(--aw-fg-2);
  background: #fff;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(16, 24, 40, .16);
}

:global(.production-mrp-modal .aw-help-tip:hover .aw-help-pop),
:global(.production-mrp-modal .aw-help-tip:focus .aw-help-pop) {
  display: block;
}

.aw-upload-card {
  padding: 22px;
  text-align: center;
  color: var(--aw-fg-3);
  border: 1px dashed var(--aw-border-strong);
  border-radius: 8px;
  background: #fff;
}

.danger {
  color: var(--aw-danger);
}
</style>
