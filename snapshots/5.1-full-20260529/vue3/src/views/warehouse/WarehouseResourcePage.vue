<template>
  <operation-setting-page v-if="settingModule" :module="settingModule" />
  <warehouse-create-view v-else-if="isCreate" :module-key="moduleKey" :action-mode="actionMode" @back="goList" />
  <warehouse-detail-view v-else-if="detailId" :module-key="moduleKey" :id="detailId" @back="goList" />
  <aw-list-page v-else>
    <template v-if="activeListConfig.tree" #tree>
      <aw-resource-tree v-model="pickedTree" :title="activeListConfig.tree.title" :total="activeListRows.length" :nodes="activeListConfig.tree.nodes" />
    </template>

    <aw-list-toolbar
      :search-placeholder="activeListConfig.searchPlaceholder"
      :create-label="activeListConfig.createLabel"
      :actions="activeListConfig.toolbarActions"
      @search="keyword = $event"
      @refresh="loadData"
      @filter="toastText = '筛选条件已按当前模块字段准备'"
      @columns="toastText = '字段配置入口已打开'"
      @import="toastText = '导入模板已准备'"
      @export="toastText = '导出任务已创建'"
      @create="goCreate"
    />

    <aw-data-table
      :columns="activeListConfig.columns"
      :rows="tableRows"
      row-key="id"
      :total="activeFilteredItems.length"
      :bulk-actions="activeListConfig.bulkActions"
      :filter-values="columnFilters"
      :fit-width="Boolean(activeListConfig.fitWidth)"
      @column-filter="setColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === activeListConfig.linkKey" class="aw-link" @click="openDetail(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'image'" class="warehouse-thumb" />
        <span v-else-if="column.key === 'state' || column.key === 'qualityState'" :class="['aw-status', String(record.tone || statusTone(value))]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openDetail(record.id as string)">查看</span>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>

  <div v-if="toastText" class="warehouse-toast">{{ toastText }}</div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  approveWarehouse,
  createWarehouse,
  exportWarehouse,
  getWarehouseDetail,
  listWarehouse,
  printWarehouse,
  updateWarehouse,
  warehouseProducts,
  warehouseSources,
  type WarehouseDetail,
  type WarehouseLine,
  type WarehouseModule,
  type WarehouseProduct,
  type WarehouseRow,
  type WarehouseSource,
} from '@/app/api/warehouse/resources';
import type { OperationSettingModule } from '@/app/templates/operation-settings-template';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';
import type { AwBulkAction, AwTableColumn, AwTreeNode, ToolbarActionKey } from '@/components/list-page/types';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { EditableColumn, FormAction } from '@/components/form-page/types';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailFieldItem, DetailTabItem } from '@/components/detail-page/types';
import OperationSettingPage from '@/views/operation/shared/OperationSettingPage.vue';
import type { PersonPickerDept, PersonPickerPerson } from '@/components/setting-page/types';

type AnyRow = Record<string, any>;

interface WarehouseModuleConfig {
  title: string;
  searchPlaceholder: string;
  createLabel: string;
  columns: AwTableColumn[];
  linkKey: string;
  bulkActions: AwBulkAction[];
  toolbarActions?: ToolbarActionKey[];
  tree?: { title: string; nodes: AwTreeNode[] };
  fitWidth?: boolean;
}

const route = useRoute();
const router = useRouter();
const items = ref<WarehouseRow[]>([]);
const keyword = ref('');
const pickedTree = ref('all');
const toastText = ref('');
const columnFilters = reactive<Record<string, string>>({});

const moduleKey = computed<WarehouseModule>(() => {
  if (route.path.endsWith('/inventory-stocks')) return 'stocks';
  if (route.path.endsWith('/warehouse-inbounds')) return 'inbounds';
  if (route.path.endsWith('/warehouse-outbounds')) return 'outbounds';
  if (route.path.endsWith('/warehouse-transfers')) return 'transfers';
  if (route.path.endsWith('/inventory-counts')) return 'counts';
  if (route.path.endsWith('/outbound-quality-inspections')) return 'outboundQuality';
  return 'locations';
});

const settingModule = computed<OperationSettingModule | null>(() => {
  if (!route.query.setting) return null;
  const map: Record<WarehouseModule, OperationSettingModule> = {
    stocks: 'warehouseStocks',
    inbounds: 'warehouseInbounds',
    outbounds: 'warehouseOutbounds',
    transfers: 'warehouseTransfers',
    counts: 'inventoryCounts',
    outboundQuality: 'warehouseOutbounds',
    locations: 'warehouseLocations',
  };
  return map[moduleKey.value];
});
const routeAction = computed(() => typeof route.query.action === 'string' ? route.query.action : '');
const createActions = ['new', '直接入库', '直接出库', '新增调拨', '直接盘点', '新增出货质检', '新增出库质检'];
const isCreate = computed(() => createActions.includes(routeAction.value));
const actionMode = computed(() => String(route.query.action || 'new'));
const detailId = computed(() => typeof route.query.id === 'string' ? route.query.id : '');

const commonActions: ToolbarActionKey[] = ['refresh', 'filter', 'columns', 'export', 'import', 'create'];
const noCreateActions: ToolbarActionKey[] = ['refresh', 'filter', 'columns', 'export', 'import'];

const configs: Record<WarehouseModule, WarehouseModuleConfig> = {
  stocks: {
    title: '库存管理',
    searchPlaceholder: '全局搜索（如产品名称、产品编号、批次、仓库…）',
    createLabel: '',
    linkKey: 'name',
    toolbarActions: noCreateActions,
    bulkActions: [{ key: 'freeze', label: '批量冻结' }, { key: 'export', label: '批量导出' }],
    tree: {
      title: '库存列表',
      nodes: [
        { key: 'all', label: '全部库存', count: 3, icon: 'line-folder', level: 2, open: true },
        { key: '成品', label: '成品', count: 1, icon: 'line-node', level: 3 },
        { key: '半成品', label: '半成品', count: 1, icon: 'line-node', level: 3 },
        { key: '原材料', label: '原材料', count: 1, icon: 'line-node', level: 3 },
        { key: '包装耗材', label: '包装耗材', count: 0, icon: 'line-node', level: 3 },
      ],
    },
    columns: [
      { key: 'image', title: '图片', width: 80 },
      { key: 'ledgerNo', title: '台账编号', width: 140 },
      { key: 'name', title: '产品名称', width: 150, link: true },
      { key: 'code', title: '产品编号', width: 150 },
      { key: 'model', title: '产品型号', width: 110 },
      { key: 'cat', title: '产品分类', width: 110, filterOptions: ['成品', '半成品', '原材料', '包装耗材'] },
      { key: 'unit', title: '产品单位', width: 90 },
      { key: 'stock', title: '库存数量', width: 90 },
      { key: 'workshop', title: '车间数量', width: 90 },
      { key: 'inTransit', title: '在途数量', width: 90 },
      { key: 'frozen', title: '冻结数量', width: 90 },
      { key: 'occupied', title: '占用数量', width: 90 },
      { key: 'available', title: '可用数量', width: 90 },
      { key: 'wh', title: '仓库', width: 120 },
      { key: 'qualityState', title: '质量状态', width: 110 },
      { key: 'costLayer', title: '成本层', width: 150 },
      { key: 'sourceLine', title: '来源明细', width: 150 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  inbounds: {
    title: '入库管理',
    searchPlaceholder: '全局搜索（如供应商、产品名称、入库单号…）',
    createLabel: '新增入库',
    toolbarActions: noCreateActions,
    linkKey: 'subject',
    bulkActions: [{ key: 'putaway', label: '批量上架' }],
    columns: inboundOutboundColumns('入库'),
  },
  outbounds: {
    title: '出库管理',
    searchPlaceholder: '全局搜索（如客户、产品名称、工单编号…）',
    createLabel: '新增出库',
    toolbarActions: noCreateActions,
    linkKey: 'subject',
    bulkActions: [{ key: 'pick', label: '批量拣货' }],
    columns: inboundOutboundColumns('出库'),
  },
  transfers: {
    title: '调拨管理',
    searchPlaceholder: '全局搜索（如物料、调拨单号、仓库）',
    createLabel: '新增调拨',
    toolbarActions: commonActions,
    linkKey: 'subject',
    bulkActions: [{ key: 'confirm', label: '批量确认' }],
    columns: [
      { key: 'subject', title: '调拨主题', width: 190, link: true },
      { key: 'code', title: '调拨单号', width: 150 },
      { key: 'qty', title: '调拨数量', width: 100 },
      { key: 'fromWh', title: '原仓库', width: 130 },
      { key: 'toWh', title: '目标仓库', width: 130 },
      { key: 'date', title: '调拨日期', width: 120 },
      { key: 'user', title: '经办人', width: 100 },
      { key: 'state', title: '调拨状态', width: 150, filterOptions: ['调拨出库待确认', '调入确认中', '已完成'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  counts: {
    title: '盘点管理',
    searchPlaceholder: '全局搜索（如盘点主题、产品名称、工单编号…）',
    createLabel: '直接盘点',
    toolbarActions: noCreateActions,
    linkKey: 'subject',
    bulkActions: [{ key: 'count', label: '批量盘点' }],
    columns: [
      { key: 'subject', title: '盘点主题', width: 180, link: true },
      { key: 'code', title: '盘点编号', width: 150 },
      { key: 'wh', title: '盘点仓库', width: 120 },
      { key: 'scope', title: '盘点范围', width: 140 },
      { key: 'lockScope', title: '锁库范围', width: 180 },
      { key: 'locked', title: '是否锁库', width: 90, filterOptions: ['是', '否'] },
      { key: 'lockQty', title: '锁库数量', width: 90 },
      { key: 'date', title: '盘点日期', width: 120 },
      { key: 'user', title: '盘点人', width: 100 },
      { key: 'state', title: '盘点状态', width: 120, filterOptions: ['未开始', '盘点中', '复盘中', '差异待调整'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  outboundQuality: {
    title: '出库质检',
    searchPlaceholder: '全局搜索（如出货检验主题、OQC单号、产品/批次）',
    createLabel: '新增出库质检',
    toolbarActions: commonActions,
    linkKey: 'subject',
    bulkActions: [{ key: 'process', label: '批量处理' }],
    tree: {
      title: 'OQC分类',
      nodes: ['全部OQC', '待出货检验', '客户验货', '让步放行', '拒收重检'].map((label, index) => ({
        key: index === 0 ? 'all' : label,
        label,
        count: index === 0 ? 4 : 1,
        icon: index === 0 ? 'line-folder' : 'line-node',
        level: index === 0 ? 2 : 3,
        open: index === 0,
      })),
    },
    columns: [
      { key: 'subject', title: '出货检验主题', width: 180, link: true },
      { key: 'code', title: 'OQC单号', width: 150 },
      { key: 'source', title: '销售/出库单', width: 200 },
      { key: 'object', title: '客户/产品', width: 200 },
      { key: 'qty', title: '数量/抽样', width: 140 },
      { key: 'inspector', title: '检验员', width: 100 },
      { key: 'date', title: '质检日期', width: 120 },
      { key: 'state', title: 'OQC状态', width: 130, filterOptions: ['待出货检验', '客户验货中', '待放行审批', '已放行', '客户拒收', '已拦截'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  locations: {
    title: '仓库库位',
    searchPlaceholder: '全局搜索（如仓库、区域、库位）',
    createLabel: '新增',
    toolbarActions: commonActions,
    linkKey: 'name',
    bulkActions: [{ key: 'enable', label: '批量启用' }],
    tree: {
      title: '库位管理',
      nodes: [
        { key: 'all', label: '全部仓库', count: 3, icon: 'line-folder', level: 2, open: true },
        { key: '仓库A', label: '仓库A', count: 2, icon: 'line-folder', level: 2, open: true },
        { key: '区域', label: '区域', count: 1, icon: 'line-node', level: 3 },
        { key: '库位', label: '库位', count: 1, icon: 'line-node', level: 3 },
        { key: '仓库B', label: '仓库B', count: 1, icon: 'line-folder', level: 2 },
      ],
    },
    columns: [
      { key: 'code', title: '区域编号', width: 130 },
      { key: 'name', title: '区域名称', width: 140, link: true },
      { key: 'desc', title: '区域描述', width: 160 },
      { key: 'capacity', title: '容量', width: 100 },
      { key: 'warehouse', title: '所属仓库', width: 130 },
      { key: 'manager', title: '仓库负责人', width: 110 },
      { key: 'address', title: '仓库地址', width: 240 },
      { key: 'state', title: '区域状态', width: 100, filterOptions: ['可用', '禁用'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
};

const inboundDetailRows: WarehouseRow[] = [
  { id: 'inbound_detail_001', name: '半成品物料', code: '7820864', model: '规格一', unit: '公斤', waiting: 500, people: '李文涛、陈思源', note: '可点击对应入库单填写入库数量和库位' },
  { id: 'inbound_detail_002', name: '铝合金型材', code: '8518691', model: 'AL-6061', unit: 'KG', waiting: 300, people: '赵强', note: '可点击对应入库单填写入库数量和库位' },
  { id: 'inbound_detail_003', name: '包装纸箱', code: '6081578', model: 'PK-01', unit: '个', waiting: 120, people: '老夏', note: '可点击对应入库单填写入库数量和库位' },
];

const outboundDetailRows: WarehouseRow[] = [
  { id: 'outbound_detail_001', name: '产品一', code: '123456', model: '规格一', unit: '个', qty: 100, people: '李文涛、陈思源', note: '可出库未出库' },
  { id: 'outbound_detail_002', name: '半成品物料', code: '7820864', model: 'HM-450', unit: 'KG', qty: 300, people: '赵强', note: '库存已锁定，暂存状态' },
  { id: 'outbound_detail_003', name: '铝合金型材', code: '8518691', model: 'AL-6061', unit: 'KG', qty: 80, people: '李文涛', note: '可出库未出库' },
];

const transferDetailRows: WarehouseRow[] = [
  { id: 'transfer_detail_001', sourceLine: 'DB-20251221001-01', name: '半成品物料', code: '7820864', batch: 'B20250601', qualityState: '合格', tone: 'green', unit: '公斤', qty: 500, transferFrozenQty: 500, inTransitQty: 8, inQty: 492, fromWh: '二号仓库', toWh: '仓库0545', date: '2025-12-21' },
  { id: 'transfer_detail_002', sourceLine: 'DB-20251221001-02', name: '半成品物料', code: '5786931', batch: 'B20250602', qualityState: '合格', tone: 'green', unit: '公斤', qty: 300, transferFrozenQty: 300, inTransitQty: 0, inQty: 300, fromWh: '二号仓库', toWh: '仓库0545', date: '2025-12-21' },
  { id: 'transfer_detail_003', sourceLine: 'DB-20251221003-01', name: '铝合金型材', code: '8518691', batch: 'AL20250602', qualityState: '待检', tone: 'yellow', unit: 'KG', qty: 120, transferFrozenQty: 120, inTransitQty: 120, inQty: 0, fromWh: '原料仓', toWh: '生产线边仓', date: '2025-12-19' },
];

const warehouseRows: WarehouseRow[] = [
  { id: 'warehouse_001', code: 'WH-A', name: '仓库A', type: '成品仓', manager: '王仓', phone: '13800000001', address: '广东省深圳市宝安区一号园区', state: '启用', tone: 'green' },
  { id: 'warehouse_002', code: 'WH-B', name: '仓库B', type: '原料仓', manager: '李库', phone: '13800000002', address: '广东省东莞市松山湖二号园区', state: '启用', tone: 'green' },
];

const inventoryPlanRows: WarehouseRow[] = [
  { id: 'inventory_plan_001', title: '2026 Q1 成品仓全量盘点', wh: '一号仓库、二号仓库', scope: '成品、半成品', lock: '锁定盘点范围库存', cycle: '季度', owner: '王仓', progress: '待生成盘点单' },
  { id: 'inventory_plan_002', title: '原材料批次抽盘计划', wh: '原料仓', scope: '原材料 / 最近30天入库批次', lock: '锁定命中批次库存', cycle: '月度', owner: '李库', progress: '执行中 45%' },
  { id: 'inventory_plan_003', title: '临期与冻结物料复盘', wh: '质检暂存仓', scope: '冻结库存、临期库存', lock: '仅锁定异常库存', cycle: '临时', owner: '陈仓', progress: '已完成' },
];

function detailStatsColumns(waitingTitle: string): AwTableColumn[] {
  return [
    { key: 'name', title: '物料名称' },
    { key: 'code', title: '物料编码' },
    { key: 'model', title: '规格型号' },
    { key: 'unit', title: '单位', width: 72 },
    { key: waitingTitle === '待入库数量' ? 'waiting' : 'qty', title: waitingTitle, width: 104 },
    { key: 'people', title: '相关人员' },
    { key: 'note', title: '说明' },
  ];
}

function getActionListConfig(module: WarehouseModule, action: string, tab: unknown): WarehouseModuleConfig | null {
  if (module === 'inbounds' && action === '待入库明细') {
    return {
      title: '待入库明细',
      searchPlaceholder: '全局搜索（如物料名称、物料编码）',
      createLabel: '',
      toolbarActions: noCreateActions,
      linkKey: '',
      bulkActions: [{ key: 'batchInbound', label: '批量入库' }],
      fitWidth: true,
      columns: detailStatsColumns('待入库数量'),
    };
  }
  if (module === 'outbounds' && (action === '待出库明细' || action === '待申请发货')) {
    return {
      title: action,
      searchPlaceholder: '全局搜索（如物料名称、物料编码）',
      createLabel: '',
      toolbarActions: noCreateActions,
      linkKey: '',
      bulkActions: [{ key: action === '待申请发货' ? 'batchApplyShip' : 'batchOutbound', label: action === '待申请发货' ? '批量申请发货' : '批量出库' }],
      fitWidth: true,
      columns: detailStatsColumns('待出库数量'),
    };
  }
  if (module === 'transfers' && action === '调拨明细表') {
    return {
      title: '调拨明细表',
      searchPlaceholder: '全局搜索（如物料名称、物料编码、仓库）',
      createLabel: '',
      toolbarActions: noCreateActions,
      linkKey: '',
      bulkActions: [{ key: 'batchTransfer', label: '批量处理' }],
      columns: [
        { key: 'sourceLine', title: '来源明细', width: 170 },
        { key: 'name', title: '物料名称', width: 140 },
        { key: 'code', title: '物料编码', width: 140 },
        { key: 'batch', title: '批次', width: 120 },
        { key: 'qualityState', title: '质量状态', width: 110 },
        { key: 'unit', title: '单位', width: 90 },
        { key: 'qty', title: '调拨数量', width: 110 },
        { key: 'transferFrozenQty', title: '调拨冻结', width: 110 },
        { key: 'inTransitQty', title: '在途数量', width: 110 },
        { key: 'inQty', title: '调入数量', width: 110 },
        { key: 'fromWh', title: '原仓库', width: 130 },
        { key: 'toWh', title: '目标仓库', width: 130 },
        { key: 'date', title: '调拨日期', width: 120 },
      ],
    };
  }
  if (module === 'counts' && action === '盘点计划') {
    return {
      title: '盘点计划',
      searchPlaceholder: '全局搜索（如计划名称、仓库、负责人）',
      createLabel: '',
      toolbarActions: noCreateActions,
      linkKey: '',
      bulkActions: [{ key: 'generate', label: '批量生成盘点单' }],
      fitWidth: true,
      columns: [
        { key: 'title', title: '计划名称' },
        { key: 'cycle', title: '盘点周期', width: 96 },
        { key: 'owner', title: '计划负责人', width: 104 },
        { key: 'wh', title: '盘点仓库' },
        { key: 'scope', title: '盘点范围' },
        { key: 'lock', title: '锁库策略' },
        { key: 'progress', title: '进度', width: 120 },
      ],
    };
  }
  if (module === 'locations' && tab === 'warehouses') {
    return {
      ...configs.locations,
      searchPlaceholder: '全局搜索（如仓库名称、仓库编码、负责人）',
      linkKey: 'name',
      columns: [
        { key: 'code', title: '仓库编码', width: 130 },
        { key: 'name', title: '仓库名称', width: 150, link: true },
        { key: 'type', title: '仓库类型', width: 120 },
        { key: 'manager', title: '仓库负责人', width: 120 },
        { key: 'phone', title: '联系方式', width: 140 },
        { key: 'address', title: '仓库地址', width: 260 },
        { key: 'state', title: '仓库状态', width: 100 },
        { key: 'action', title: '操作', width: 90, fixed: 'right' },
      ],
    };
  }
  return null;
}

function getActionListRows(module: WarehouseModule, action: string, tab: unknown): WarehouseRow[] {
  if (module === 'inbounds' && action === '待入库明细') return inboundDetailRows;
  if (module === 'outbounds' && action === '待出库明细') return outboundDetailRows;
  if (module === 'outbounds' && action === '待申请发货') return outboundDetailRows.map((row) => ({ ...row, note: '订单流转策略为否，需要手动申请发货' }));
  if (module === 'transfers' && action === '调拨明细表') return transferDetailRows;
  if (module === 'counts' && action === '盘点计划') return inventoryPlanRows;
  if (module === 'locations' && tab === 'warehouses') return warehouseRows;
  return [];
}

const moduleConfig = computed(() => configs[moduleKey.value]);
const actionListConfig = computed<WarehouseModuleConfig | null>(() => getActionListConfig(moduleKey.value, routeAction.value, route.query.tab));
const activeListConfig = computed(() => actionListConfig.value || moduleConfig.value);
const actionListRows = computed<WarehouseRow[]>(() => getActionListRows(moduleKey.value, routeAction.value, route.query.tab));
const activeListRows = computed(() => actionListConfig.value ? actionListRows.value : items.value);
const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return activeListRows.value.filter((item) => {
    const keywordMatched = !term || JSON.stringify(item).includes(term);
    const actionMatched = actionListConfig.value ? true : actionFilterMatched(moduleKey.value, routeAction.value, item);
    const treeMatched = pickedTree.value === 'all'
      || item.cat === pickedTree.value
      || item.warehouse === pickedTree.value
      || item.state === pickedTree.value;
    const filterMatched = Object.entries(columnFilters).every(([key, value]) => !value || item[key] === value);
    return keywordMatched && actionMatched && treeMatched && filterMatched;
  });
});
const activeFilteredItems = filteredItems;
const tableRows = computed(() => filteredItems.value.map((row) => ({ ...row, action: actionListConfig.value ? '' : '查看' })));

watch(() => route.fullPath, () => {
  if (settingModule.value || isCreate.value) return;
  keyword.value = '';
  pickedTree.value = 'all';
  Object.keys(columnFilters).forEach((key) => delete columnFilters[key]);
  loadData();
}, { immediate: true });

watch(toastText, (value) => {
  if (!value) return;
  window.setTimeout(() => {
    toastText.value = '';
  }, 1800);
});

function inboundOutboundColumns(label: '入库' | '出库'): AwTableColumn[] {
  return [
    { key: 'subject', title: `${label}主题`, width: 180, link: true },
    { key: 'code', title: `${label}单号`, width: 150 },
    { key: 'type', title: `${label}类别`, width: 120, filterOptions: label === '入库' ? ['采购入库', '生产入库', '退货入库', '委外入库', '直接入库'] : ['内部领用', '委外领料', '销售出库', '采购退货', '直接出库'] },
    { key: 'qty', title: `${label}数量`, width: 100 },
    { key: 'applyDate', title: '申请日期', width: 120 },
    { key: 'user', title: `${label}人员`, width: 110 },
    { key: 'date', title: `${label}日期`, width: 120 },
    { key: 'state', title: `${label}状态`, width: 130, filterOptions: label === '入库' ? ['已收货待检', '已上架过账', '待上架', '质检中', '已入库'] : ['已审核待占用', '拣货中', 'OQC待放行', '待复核', '已过账'] },
    { key: 'action', title: '操作', width: 90, fixed: 'right' },
  ];
}

function actionFilterMatched(module: WarehouseModule, action: string, item: WarehouseRow) {
  if (module === 'inbounds' && action === '待入库单') return !['已上架过账', '已入库', '关闭'].includes(String(item.state || ''));
  if (module === 'outbounds' && action === '待出库单') return !['已出库过账', '已过账', '异常关闭'].includes(String(item.state || ''));
  if (module === 'outbounds' && action === '待申请发货') return ['OQC待放行', '待复核', '已审核待占用'].includes(String(item.state || ''));
  return true;
}

function statusTone(value: unknown) {
  if (['合格', '启用', '已过账', '已完成', '可用'].includes(String(value))) return 'green';
  if (['待检', '待审批', '已锁定', '待复核', '禁用'].includes(String(value))) return 'yellow';
  return '';
}

async function loadData() {
  const result = await listWarehouse(moduleKey.value);
  items.value = result.items;
}

function setColumnFilter(columnKey: string, value: string) {
  if (value) columnFilters[columnKey] = value;
  else delete columnFilters[columnKey];
}

function goCreate() {
  if (moduleKey.value === 'stocks') return;
  router.push({ path: route.path, query: { action: 'new' } });
}

function openDetail(id: string) {
  router.push({ path: route.path, query: { id } });
}

function goList() {
  router.push({ path: route.path });
}

const field = (label: string, value: unknown): DetailFieldItem => ({ label, value: String(value ?? '-') });

const personPickerDepts: PersonPickerDept[] = [
  {
    key: 'warehouse',
    label: '仓储部',
    persons: [
      { id: 'p_wh_001', name: '王仓', role: '仓库主管', dept: '仓储部' },
      { id: 'p_wh_002', name: '李库', role: '库管员', dept: '仓储部' },
      { id: 'p_wh_003', name: '陈仓', role: '调拨员', dept: '仓储部' },
    ],
  },
  {
    key: 'quality',
    label: '质检部',
    persons: [
      { id: 'p_qc_001', name: '陈质检', role: 'OQC检验员', dept: '质检部' },
      { id: 'p_qc_002', name: '王质检', role: '质量主管', dept: '质检部' },
    ],
  },
];

const WarehouseCreateView = defineComponent({
  name: 'WarehouseCreateView',
  props: {
    moduleKey: { type: String, required: true },
    actionMode: { type: String, default: 'new' },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const rows = ref<AnyRow[]>(createInitialCreateRows(props.moduleKey as WarehouseModule));
    const showProductPicker = ref(false);
    const showSourcePicker = ref(false);
    const showPersonPicker = ref(false);
    const person = ref('');
    const source = ref<WarehouseSource | null>(null);
    const feedback = ref('');
    const module = computed(() => props.moduleKey as WarehouseModule);
    const title = computed(() => createTitle(module.value, props.actionMode));
    const actions = computed<FormAction[]>(() => [
      { key: 'cancel', label: '取消' },
      { key: 'save', label: '暂存' },
      { key: 'submit', label: createSubmitText(module.value), primary: true },
    ]);

    function addProducts(products: WarehouseProduct[]) {
      const next = products.map((item, index) => {
        if (['inbounds', 'outbounds', 'transfers'].includes(module.value)) {
          return createLineFromProduct(item, Date.now() + index, module.value);
        }
        return {
          id: `${item.id}_${Date.now()}_${index}`,
          itemCode: item.code,
          itemName: item.name,
          model: item.model,
          type: item.type,
          unit: item.unit,
          batch: item.batch,
          location: item.location,
          qualityState: item.qualityState,
          costLayer: item.costLayer,
          available: item.available,
          qty: module.value === 'counts' ? item.available : 1,
          realQty: module.value === 'counts' ? item.available : undefined,
          unitCost: item.unitCost,
          amount: Number(item.unitCost),
          remark: '',
        };
      });
      rows.value = [...rows.value, ...next];
      showProductPicker.value = false;
    }

    function pickSource(item: WarehouseSource) {
      source.value = item;
      rows.value = item.lines.map((line) => ({ ...line, id: `${line.id}_${Date.now()}` }));
      showSourcePicker.value = false;
    }

    async function handleAction(key: string) {
      if (key === 'cancel') {
        emit('back');
        return;
      }
      if (key === 'reset') {
        rows.value = [];
        source.value = null;
        person.value = '';
        feedback.value = '表单已重置';
        return;
      }
      const res = key === 'submit'
        ? await createWarehouse(module.value, { title: title.value, source: source.value, person: person.value, lines: rows.value })
        : await updateWarehouse(module.value, 'draft', { source: source.value, person: person.value, lines: rows.value });
      feedback.value = key === 'submit' ? `提交成功：${String(res.id)}` : '暂存成功';
    }

    return () => h(AwFormPage, { backText: '返回列表', actions: actions.value, onBack: () => emit('back'), onAction: handleAction }, () => [
      whSection('基础信息', [
        h('div', { class: 'aw-form-grid' }, createBaseFields(module.value, props.actionMode, person.value, source.value, () => { showPersonPicker.value = true; }, () => { showSourcePicker.value = true; })),
        feedback.value ? h('div', { class: 'aw-form-note warehouse-note' }, feedback.value) : null,
        createStrategyNote(module.value, props.actionMode),
      ]),
      whSection(createLineTitle(module.value), renderCreateLineContent(module.value, rows, () => { showProductPicker.value = true; })),
      whSection('附件', h('div', { class: 'aw-upload-card' }, [h('span', { class: 'aw-link' }, '点击上传'), ' / 拖拽到此区域'])),
      whSection('详情', h(AwRichTextEditor, { placeholder: createRemarkPlaceholder(module.value) })),
      showSourcePicker.value ? h(SourcePickerModal, { moduleKey: module.value, onClose: () => { showSourcePicker.value = false; }, onConfirm: pickSource }) : null,
      showProductPicker.value ? h(ProductPickerModal, { onClose: () => { showProductPicker.value = false; }, onConfirm: addProducts }) : null,
      showPersonPicker.value ? h(AwPersonPickerModal as any, {
        open: true,
        title: '选择经办人',
        depts: personPickerDepts,
        picked: [],
        onCancel: () => { showPersonPicker.value = false; },
        onConfirm: (people: PersonPickerPerson[]) => {
          person.value = people.map((item) => item.name).join('、') || '王仓';
          showPersonPicker.value = false;
        },
      }) : null,
    ]);
  },
});

const WarehouseDetailView = defineComponent({
  name: 'WarehouseDetailView',
  props: {
    moduleKey: { type: String, required: true },
    id: { type: String, required: true },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const detail = ref<WarehouseDetail | null>(null);
    const editing = ref(false);
    const activeTab = ref('');
    const feedback = ref('');
    const module = computed(() => props.moduleKey as WarehouseModule);
    const tabs = computed(() => detailTabs(module.value));
    watch(() => [props.moduleKey, props.id], async () => {
      detail.value = await getWarehouseDetail(module.value, props.id);
      activeTab.value = tabs.value[0]?.key || '';
      editing.value = false;
    }, { immediate: true });
    const actions = computed<DetailAction[]>(() => detailActions(module.value, editing.value));

    async function doAction(key: string) {
      if (!detail.value) return;
      if (key === 'edit') {
        editing.value = true;
        feedback.value = '已进入编辑态';
      } else if (key === 'save') {
        await updateWarehouse(module.value, detail.value.id, detail.value);
        editing.value = false;
        feedback.value = '保存成功';
      } else if (key === 'approve') {
        await approveWarehouse(module.value, detail.value.id);
        feedback.value = '审批动作已提交';
      } else if (key === 'print') {
        await printWarehouse(module.value, detail.value.id);
        feedback.value = '打印任务已创建';
      } else if (key === 'export') {
        await exportWarehouse(module.value, detail.value.id);
        feedback.value = '导出任务已创建';
      }
    }

    return () => detail.value ? h(AwDetailPage, null, {
      toolbar: () => h(AwDetailToolbar, { backText: '返回列表', actions: actions.value, onBack: () => emit('back'), onAction: doAction }),
      header: () => h(AwDetailHeader, {
        title: detailTitle(module.value, detail.value!),
        code: String(detail.value!.code || detail.value!.ledgerNo || detail.value!.id),
        statusText: String(detail.value!.state || '进行中'),
        statusTone: String(detail.value!.tone || 'blue'),
        metas: detailMetas(module.value, detail.value!),
      }),
      default: () => [
        feedback.value ? h('div', { class: 'warehouse-feedback' }, feedback.value) : null,
        h('section', { class: 'aw-card' }, [
          h(AwDetailTabs, { modelValue: activeTab.value, tabs: tabs.value, 'onUpdate:modelValue': (key: string) => { activeTab.value = key; } }),
          renderDetailTab(module.value, detail.value!, activeTab.value, editing.value),
        ]),
      ],
    }) : h('div', { class: 'aw-card' }, '加载中...');
  },
});

const SourcePickerModal = defineComponent({
  name: 'SourcePickerModal',
  props: { moduleKey: { type: String, required: true } },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const selected = ref(warehouseSources[0]);
    return () => h('div', { class: 'aw-mask', onClick: () => emit('close') }, [
      h('div', { class: 'warehouse-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'warehouse-modal-head' }, [h('strong', null, sourceTitle(props.moduleKey as WarehouseModule)), h('button', { type: 'button', onClick: () => emit('close') }, '×')]),
        h('div', { class: 'warehouse-modal-body' }, [
          h('table', { class: 'aw-table' }, [
            h('thead', null, h('tr', null, ['选择', '来源类型', '来源单号', '来源主题', '来源对象', '日期'].map((label) => h('th', null, label)))),
            h('tbody', null, warehouseSources.map((row) => h('tr', { key: row.id, onClick: () => { selected.value = row; } }, [
              h('td', null, h('input', { type: 'radio', checked: selected.value.id === row.id })),
              h('td', null, row.type),
              h('td', null, row.code),
              h('td', null, row.title),
              h('td', null, row.object),
              h('td', null, row.date),
            ]))),
          ]),
        ]),
        h('div', { class: 'warehouse-modal-foot' }, [
          h('button', { class: 'aw-tool-btn', type: 'button', onClick: () => emit('close') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', selected.value) }, '确认选择'),
        ]),
      ]),
    ]);
  },
});

const ProductPickerModal = defineComponent({
  name: 'ProductPickerModal',
  emits: ['close', 'confirm'],
  setup(_, { emit }) {
    const selected = ref(new Set<string>());
    function toggle(id: string) {
      const next = new Set(selected.value);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      selected.value = next;
    }
    return () => h('div', { class: 'aw-mask', onClick: () => emit('close') }, [
      h('div', { class: 'aw-modal aw-warehouse-picker-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [h('span', '选择物品'), h('button', { class: 'aw-modal-close', type: 'button', onClick: () => emit('close') }, '×')]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-picker-count' }, `已勾选 ${selected.value.size} 项`),
          h('div', { class: 'aw-doc-tbl-inner' }, [
            h('table', { class: 'aw-doc-tbl' }, [
              h('thead', [h('tr', ['选择', '物品编码', '物品名称', '规格型号', '类型', '单位', '批次', '库位', '可用量'].map((label) => h('th', label)))]),
              h('tbody', warehouseProducts.map((row) => h('tr', { key: row.id, class: selected.value.has(row.id) ? 'picked' : '', onClick: () => toggle(row.id) }, [
                h('td', [h('input', { type: 'checkbox', checked: selected.value.has(row.id), onClick: (event: Event) => event.stopPropagation(), onChange: () => toggle(row.id) })]),
                h('td', { class: 'aw-num' }, row.code),
                h('td', { class: 'aw-link' }, row.name),
                h('td', row.model),
                h('td', row.type),
                h('td', row.unit),
                h('td', row.batch),
                h('td', row.location),
                h('td', String(row.available)),
              ]))),
            ]),
          ]),
        ]),
        h('div', { class: 'foot' }, [
          h('button', { class: 'aw-btn', type: 'button', onClick: () => emit('close') }, '取消'),
          h('button', { class: 'aw-btn primary', type: 'button', onClick: () => emit('confirm', warehouseProducts.filter((row) => selected.value.has(row.id))) }, '确定'),
        ]),
      ]),
    ]);
  },
});

function createTitle(module: WarehouseModule, action: string) {
  if (['直接入库', '直接出库', '新增调拨', '直接盘点'].includes(action)) return action;
  return ({
    inbounds: '新增入库',
    outbounds: '新增出库',
    transfers: '新增调拨',
    counts: '直接盘点',
    outboundQuality: '新增出库质检',
    locations: '新增仓库/区域/库位',
  } as Partial<Record<WarehouseModule, string>>)[module] || '新增';
}

function createSubmitText(module: WarehouseModule) {
  if (module === 'inbounds') return '确认入库';
  if (module === 'outbounds') return '确认出库';
  if (module === 'transfers') return '提交调拨';
  return module === 'counts' ? '确认盘点' : module === 'outboundQuality' ? '提交质检' : '提交';
}

function createLineTitle(module: WarehouseModule) {
  if (['inbounds', 'outbounds', 'transfers'].includes(module)) return '物品明细';
  if (module === 'counts') return '物品明细';
  if (module === 'outboundQuality') return '抽样与检验明细';
  if (module === 'locations') return '关联物码';
  return '来源与物品明细';
}

function createRemarkPlaceholder(module: WarehouseModule) {
  if (module === 'counts') return '填写盘点说明、范围依据、锁库策略、差异处理要求等信息';
  if (module === 'outboundQuality') return '请输入来源说明、抽样偏差、不良原因、处置建议、复检要求等';
  return '填写仓储业务备注、来源说明、库位策略和处理要求';
}

function createInitialCreateRows(module: WarehouseModule): AnyRow[] {
  if (module === 'transfers') return createTransferInitialRows();
  const baseProducts = warehouseProducts.slice(0, 1);
  return baseProducts.map((item, index) => createLineFromProduct(item, index, module));
}

function createTransferInitialRows(): AnyRow[] {
  return [
    {
      id: 'transfer_form_001',
      sourceLine: 'DB-20251221001-01',
      code: '7820864',
      itemCode: '7820864',
      name: '半成品物料',
      itemName: '半成品物料',
      model: '规格一',
      type: '物料',
      unit: '公斤',
      batch: 'B20250601',
      qualityState: '合格',
      costLayer: 'LAYER-TR-01',
      currentQty: 620,
      availableQty: 560,
      frozenQty: 60,
      transferFrozenQty: 500,
      inTransitQty: 8,
      qty: 500,
      outQty: 500,
      inQty: 492,
      diffQty: 8,
      fromWh: '二号仓库',
      fromLocation: 'B区-B01-01',
      toWh: '仓库0545',
      toLocation: 'A区-A01-01',
      remark: '',
    },
    {
      id: 'transfer_form_002',
      sourceLine: 'DB-20251221001-02',
      code: '5786931',
      itemCode: '5786931',
      name: '半成品物料',
      itemName: '半成品物料',
      model: '规格一',
      type: '物料',
      unit: '公斤',
      batch: 'B20250602',
      qualityState: '合格',
      costLayer: 'LAYER-TR-02',
      currentQty: 360,
      availableQty: 320,
      frozenQty: 40,
      transferFrozenQty: 300,
      inTransitQty: 0,
      qty: 300,
      outQty: 300,
      inQty: 300,
      diffQty: 0,
      fromWh: '二号仓库',
      fromLocation: 'B区-B01-02',
      toWh: '仓库0545',
      toLocation: 'A区-A01-02',
      remark: '',
    },
  ];
}

function createLineFromProduct(item: WarehouseProduct, index: number, module: WarehouseModule): AnyRow {
  const qty = module === 'transfers' ? 20 : module === 'outbounds' ? 2 : 1;
  return {
    id: `${module}_${item.id}_${index}`,
    sourceDoc: module === 'inbounds' ? '手动入库' : module === 'outbounds' ? '手动出库' : '',
    sourceLine: '手动明细',
    itemCode: item.code,
    code: item.code,
    itemName: item.name,
    name: item.name,
    model: item.model,
    type: item.type,
    unit: item.unit,
    batch: item.batch,
    location: item.location,
    qualityState: item.qualityState,
    costLayer: item.costLayer,
    shouldQty: module === 'inbounds' ? qty : undefined,
    inspectionQty: module === 'inbounds' ? qty : undefined,
    qualifiedQty: module === 'inbounds' ? qty : undefined,
    concessionQty: 0,
    rejectedQty: 0,
    actualQty: qty,
    shelfQty: module === 'inbounds' ? 0 : undefined,
    qualityNo: module === 'inbounds' ? '待生成' : '',
    status: module === 'inbounds' ? '待送检' : module === 'outbounds' ? '无需OQC' : '',
    postStatus: '待过账',
    available: item.available,
    availableQty: Math.max(item.available - 60, 0),
    locked: 0,
    frozenQty: module === 'transfers' ? 60 : 0,
    qty,
    outQty: 0,
    inQty: 0,
    diffQty: 0,
    transferFrozenQty: 0,
    inTransitQty: 0,
    currentQty: item.available,
    fromWh: '二号仓库',
    fromLocation: item.location,
    toWh: '仓库0545',
    toLocation: 'A区-A01-01',
    unitCost: item.unitCost,
    amount: Number(item.unitCost) * qty,
    prodDate: '',
    expireDate: '',
    remark: '',
  };
}

function needsSource(module: WarehouseModule) {
  return ['inbounds', 'outbounds', 'transfers', 'outboundQuality'].includes(module);
}

function createBaseFields(module: WarehouseModule, action: string, person: string, source: WarehouseSource | null, openPerson: () => void, openSource: () => void) {
  if (module === 'inbounds') {
    return [
      whField('入库主题', textInput('请输入入库主题'), true),
      whField('入库单号', textInput('自动生成', { disabled: true })),
      whField('入库类型', select(['直接入库', '采购入库', '生产入库', '销售退货入库', '委外入库'], '直接入库'), true),
      whField('入库仓库', select(['请选择仓库', '仓库0545', '原料仓', '质检暂存仓']), true),
      whField('关联单据', textInput('可手动填写关联单据')),
      whField('入库部门', textInput('请选择入库部门')),
      whField('入库人员', pickerControl(person, '请选择入库人员', openPerson), true),
      whField('入库日期', textInput('请选择日期'), true),
      whField('经办人', textInput('自动带入当前用户', { disabled: true })),
    ];
  }
  if (module === 'outbounds') {
    return [
      whField('出库主题', textInput('请输入出库主题'), true),
      whField('出库单号', textInput('自动生成', { disabled: true })),
      whField('出库类型', select(['直接出库', '内部领用', '委外领料', '销售出库', '采购退货'], '直接出库'), true),
      whField('出库仓库', select(['请选择仓库', '仓库一', '仓库二', '原料仓']), true),
      whField('关联单据', textInput('可手动填写关联单据')),
      whField('出库部门', textInput('请选择出库部门')),
      whField('出库人员', pickerControl(person, '请选择出库人员', openPerson), true),
      whField('出库日期', textInput('请选择日期'), true),
      whField('经办人', textInput('自动带入当前用户', { disabled: true })),
    ];
  }
  if (module === 'transfers') {
    return [
      whField('调拨主题', textInput('填写调拨主题'), true),
      whField('调拨单号', textInput('自动生成', { disabled: true })),
      whField('调拨日期', textInput('请选择日期'), true),
      whField('原仓库', select(['请选择仓库', '一号仓库', '二号仓库', '原料仓']), true),
      whField('目标仓库', select(['请选择仓库', '仓库0545', '销售暂存仓', '生产线边仓']), true),
      whField('经办人', pickerControl(person, '请选择经办人', openPerson), true),
      whField('调拨部门', textInput('请选择调拨部门')),
      whField('调拨原因', textInput('填写调拨原因')),
      whField('调拨状态', textInput('自动生成', { disabled: true })),
    ];
  }

  const base = [
    whField(module === 'stocks' ? '调整主题' : module === 'counts' ? '盘点主题' : module === 'outboundQuality' ? '出货检验主题' : module === 'locations' ? '名称' : '单据主题', textInput('填写主题')),
    whField('单据编号', textInput('自动生成', { disabled: true })),
    whField('经办人', pickerControl(person, '请选择人员', openPerson)),
  ];
  if (needsSource(module)) {
    base.push(whField('来源单据', pickerControl(source ? `${source.type} / ${source.code}` : '', '选择来源单据', openSource)));
  }
  if (module === 'stocks') base.push(whField('调整类型', select(['盘盈入库', '盘亏出库', '库存冻结', '库存释放'])));
  if (module === 'counts') base.push(whField('盘点仓库', select(['A仓库', '原料仓', '质检暂存仓'])), whField('盘点范围', select(['指定物品', '全部库存', '指定分类', '指定库位'])), whField('是否锁库', select(['否', '是'])));
  if (module === 'outboundQuality') base.push(whField('OQC状态', select(['待出货检验', '客户验货中', '待放行审批', '已放行'])), whField('抽样规则', textInput('AQL 0.65 外观/包装抽样13台')));
  if (module === 'locations') base.push(whField('新增类型', select(['仓库', '区域', '库位'])), whField('所属仓库', select(['仓库A', '仓库B'])), whField('状态', select(['启用', '禁用'])));
  return base;
}

function whSection(title: string, children: any) {
  return h('section', { class: 'aw-form-card' }, [h('div', { class: 'aw-detail-section-title' }, title), ...(Array.isArray(children) ? children : [children])]);
}

function whField(label: string, control: any, required = false) {
  return h('div', { class: 'aw-field' }, [h('label', { class: required ? 'req' : '' }, label), control]);
}

function textInput(placeholder: string, attrs: Record<string, unknown> = {}) {
  return h('input', { class: 'aw-input', placeholder, ...attrs });
}

function pickerControl(value: string, placeholder: string, onPick: () => void) {
  return h('div', { class: 'aw-field-row' }, [
    h('input', { class: 'aw-input', value, readonly: true, placeholder }),
    h('button', { class: 'aw-tool-btn', type: 'button', onClick: onPick }, '选择'),
  ]);
}

function select(options: string[], selected = '') {
  return h('select', { class: 'aw-select' }, options.map((item) => h('option', { key: item, value: item === '请选择仓库' ? '' : item, selected: selected === item }, item)));
}

function renderCreateLineContent(module: WarehouseModule, rows: { value: AnyRow[] }, openProductPicker: () => void) {
  if (['inbounds', 'outbounds', 'transfers'].includes(module)) {
    return [
      h('div', { class: 'aw-doc-tbl-wrap warehouse-create-line-wrap' }, [
        h('div', { class: 'aw-doc-tbl-inner' }, [renderCreateLineTable(module, rows)]),
      ]),
      h('button', {
        class: 'aw-tool-btn warehouse-add-detail',
        type: 'button',
        onPointerdown: (event: Event) => { event.stopPropagation(); openProductPicker(); },
        onClick: (event: Event) => { event.stopPropagation(); openProductPicker(); },
      }, '+ 新增明细'),
    ];
  }
  return [
    h(AwEditableSubTable, { columns: editableColumns(module), rows: rows.value, addText: '添加明细', onAdd: openProductPicker }, {
      cell: ({ column, row }: { column: EditableColumn; row: AnyRow }) => renderEditableCell(module, column, row, rows),
      actions: ({ index }: { index: number }) => h('button', { class: 'aw-link-button danger', type: 'button', onClick: () => rows.value.splice(index, 1) }, '删除'),
    }),
    h('div', { class: 'aw-line-total' }, [h('span', '合计'), h('span', `共 ${rows.value.length} 行`), h('span', ['数量合计：', h('strong', String(sumQty(rows.value)))]), h('span', ['金额合计：', h('strong', sumAmount(rows.value))])]),
  ];
}

function renderCreateLineTable(module: WarehouseModule, rows: { value: AnyRow[] }) {
  const columns = createLineColumns(module);
  return h('table', { class: 'aw-doc-tbl warehouse-create-line-table' }, [
    h('thead', null, h('tr', null, [
      h('th', null, '序号'),
      ...columns.map((column) => h('th', { key: column.key }, column.title)),
      h('th', { style: 'width:70px' }, '操作'),
    ])),
    h('tbody', null, rows.value.map((row, index) => h('tr', { key: row.id || index }, [
      h('td', null, index + 1),
      ...columns.map((column) => h('td', { key: column.key }, renderCreateLineCell(module, row, column.key, rows))),
      h('td', null, h('button', { class: 'aw-link-button danger', type: 'button', onClick: () => rows.value.splice(index, 1) }, '删除')),
    ]))),
  ]);
}

function createLineColumns(module: WarehouseModule) {
  if (module === 'inbounds') {
    return [
      { key: 'sourceDoc', title: '来源单据' }, { key: 'sourceLine', title: '来源明细' }, { key: 'itemCode', title: '物品编码' },
      { key: 'itemName', title: '物品名称' }, { key: 'model', title: '规格型号' }, { key: 'unit', title: '单位' },
      { key: 'batch', title: '批次号' }, { key: 'shouldQty', title: '应入库数量' }, { key: 'inspectionQty', title: '送检数量' },
      { key: 'qualifiedQty', title: '合格数量' }, { key: 'concessionQty', title: '让步数量' }, { key: 'rejectedQty', title: '不合格数量' },
      { key: 'actualQty', title: '入库数量' }, { key: 'shelfQty', title: '上架数量' }, { key: 'location', title: '入库库位' },
      { key: 'qualityNo', title: '质检单号' }, { key: 'status', title: '质检/上架状态' }, { key: 'qualityState', title: '库存质量' },
      { key: 'costLayer', title: '成本层' }, { key: 'postStatus', title: '过账状态' }, { key: 'prodDate', title: '生产日期' },
    ];
  }
  if (module === 'outbounds') {
    return [
      { key: 'sourceDoc', title: '来源单据' }, { key: 'sourceLine', title: '来源明细' }, { key: 'itemCode', title: '物品编码' },
      { key: 'itemName', title: '物品名称' }, { key: 'model', title: '规格型号' }, { key: 'type', title: '物品类型' },
      { key: 'unit', title: '单位' }, { key: 'batch', title: '批次号' }, { key: 'qualityState', title: '质量状态' },
      { key: 'costLayer', title: '成本层' }, { key: 'location', title: '推荐库位' }, { key: 'available', title: '可用量' },
      { key: 'locked', title: '锁定量' }, { key: 'qty', title: '数量' }, { key: 'status', title: 'OQC状态' },
      { key: 'unitCost', title: '单价' }, { key: 'amount', title: '合计' }, { key: 'prodDate', title: '生产日期' }, { key: 'expireDate', title: '到期日期' },
    ];
  }
  return [
    { key: 'sourceLine', title: '来源明细' }, { key: 'code', title: '物品编码' }, { key: 'name', title: '物品名称' },
    { key: 'model', title: '规格型号' }, { key: 'type', title: '类型' }, { key: 'unit', title: '单位' },
    { key: 'batch', title: '批次' }, { key: 'qualityState', title: '质量状态' }, { key: 'costLayer', title: '成本层' },
    { key: 'currentQty', title: '当前库存' }, { key: 'availableQty', title: '可调拨量' }, { key: 'frozenQty', title: '原冻结量' },
    { key: 'transferFrozenQty', title: '调拨冻结' }, { key: 'inTransitQty', title: '在途数量' }, { key: 'qty', title: '申请调拨' },
    { key: 'outQty', title: '调出确认' }, { key: 'inQty', title: '调入确认' },
    { key: 'diffQty', title: '差异数量' }, { key: 'fromWh', title: '原仓库' }, { key: 'fromLocation', title: '原库位' },
    { key: 'toWh', title: '目标仓库' }, { key: 'toLocation', title: '目标库位' }, { key: 'remark', title: '备注' },
  ];
}

function renderCreateLineCell(module: WarehouseModule, row: AnyRow, key: string, rows: { value: AnyRow[] }) {
  if (key === 'qualityState' && row[key]) {
    return h('span', { class: row[key] === '合格' ? 'aw-state aw-state-g' : 'aw-state aw-state-y' }, row[key]);
  }
  const editableKeys = module === 'transfers'
    ? new Set(['qty', 'fromWh', 'fromLocation', 'toWh', 'toLocation', 'remark'])
    : new Set(['batch', 'inspectionQty', 'qualifiedQty', 'concessionQty', 'rejectedQty', 'actualQty', 'shelfQty', 'location', 'status', 'qualityState', 'prodDate', 'qty', 'outQty', 'inQty', 'diffQty', 'fromWh', 'fromLocation', 'toWh', 'toLocation', 'remark', 'expireDate']);
  if (!editableKeys.has(key)) return row[key] ?? '-';
  return h('input', {
    class: 'aw-input compact',
    value: row[key] ?? '',
    onInput: (event: Event) => {
      row[key] = (event.target as HTMLInputElement).value;
      if (key === 'qty' || key === 'actualQty') {
        row.amount = Number(row.unitCost || 0) * Number(row[key] || 0);
      }
      rows.value = [...rows.value];
    },
  });
}

function createStrategyNote(module: WarehouseModule, action: string) {
  if (module === 'inbounds' && action === '直接入库') {
    return h('div', { class: 'aw-form-note' }, '直接入库属于无来源入库，提交时按“直接入库审批流程”处理；若策略配置禁止无来源直接入库，则该类型应禁用并只能从来源单据生成。');
  }
  if (module === 'outbounds' && action === '直接出库') {
    return h('div', { class: 'aw-form-note' }, '直接出库属于无来源出库，提交后按出库策略校验可用库存、占用、OQC 放行和过账规则。');
  }
  if (module === 'transfers') {
    return h('div', { class: 'aw-form-note' }, '调拨提交后冻结可调拨量；调出确认转在途，调入确认后进入目标库位，差异进入调整审批。');
  }
  return null;
}

function editableColumns(module: WarehouseModule): EditableColumn[] {
  if (module === 'outboundQuality') {
    return [
      { key: 'item', title: '检验项目名称', width: 140 },
      { key: 'method', title: '检验方法', width: 120 },
      { key: 'valueType', title: '检验值类型', width: 100 },
      { key: 'standard', title: '标准值', width: 110 },
      { key: 'upper', title: '上限', width: 90 },
      { key: 'lower', title: '下限', width: 90 },
      { key: 'measured', title: '样本号/实测值', width: 130 },
      { key: 'defect', title: '缺陷等级', width: 100 },
      { key: 'result', title: '检验结论', width: 100 },
    ];
  }
  if (module === 'counts') {
    return [
      { key: 'itemCode', title: '物品编码', width: 130 },
      { key: 'itemName', title: '物品名称', width: 140 },
      { key: 'model', title: '规格型号', width: 110 },
      { key: 'batch', title: '批次', width: 120 },
      { key: 'location', title: '库位', width: 130 },
      { key: 'bookQty', title: '账面数量', width: 100 },
      { key: 'realQty', title: '实盘数量', width: 110 },
      { key: 'diffQty', title: '盈亏数量', width: 100 },
      { key: 'reason', title: '差异原因', width: 130 },
      { key: 'dispose', title: '处理方式', width: 130 },
    ];
  }
  return [
    { key: 'sourceLine', title: '来源明细', width: 150 },
    { key: 'itemCode', title: '物品编码', width: 130 },
    { key: 'itemName', title: '物品名称', width: 140 },
    { key: 'model', title: '规格型号', width: 110 },
    { key: 'unit', title: '单位', width: 80 },
    { key: 'batch', title: '批次', width: 120 },
    { key: 'location', title: '库位', width: 130 },
    { key: 'qualityState', title: '质量状态', width: 100 },
    { key: 'costLayer', title: '成本层', width: 150 },
    { key: 'qty', title: module === 'outbounds' ? '应出数量' : '入库数量', width: 100 },
    { key: 'unitCost', title: '单价', width: 100 },
    { key: 'amount', title: '合计', width: 110 },
  ];
}

function renderEditableCell(module: WarehouseModule, column: EditableColumn, row: AnyRow, rows: { value: AnyRow[] }) {
  if (['qty', 'realQty', 'measured', 'result', 'reason', 'dispose'].includes(column.key)) {
    return h('input', {
      class: 'aw-input compact',
      value: row[column.key] ?? '',
      onInput: (event: Event) => {
        row[column.key] = (event.target as HTMLInputElement).value;
        if (module === 'counts' && column.key === 'realQty') {
          row.diffQty = Number(row.realQty || 0) - Number(row.bookQty || row.qty || 0);
        }
        if (column.key === 'qty') row.amount = Number(row.qty || 0) * Number(row.unitCost || 0);
        rows.value = [...rows.value];
      },
    });
  }
  return row[column.key] ?? '-';
}

function sumQty(rows: AnyRow[]) {
  return rows.reduce((sum, row) => sum + Number(row.qty || row.actualQty || row.realQty || 0), 0);
}

function sumAmount(rows: AnyRow[]) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0).toFixed(2);
}

function sourceTitle(module: WarehouseModule) {
  if (module === 'inbounds') return '选择入库来源';
  if (module === 'outbounds') return '选择出库来源';
  if (module === 'transfers') return '选择调拨来源';
  return '选择质检来源';
}

function detailTitle(module: WarehouseModule, row: WarehouseDetail) {
  if (module === 'stocks') return `${row.name} 库存详情`;
  if (module === 'locations') return `${row.name} 库位详情`;
  return String(row.subject || row.name || row.code);
}

function detailMetas(module: WarehouseModule, row: WarehouseDetail) {
  if (module === 'stocks') return [field('产品编号', row.code), field('默认仓库', row.wh), field('可用数量', row.available)];
  if (module === 'locations') return [field('所属仓库', row.warehouse), field('负责人', row.manager), field('容量', row.capacity)];
  if (module === 'outboundQuality') return [field('来源单据', row.source), field('客户/产品', row.object), field('检验员', row.inspector)];
  return [field('类别', row.type || row.scope), field('数量', row.qty || row.lockQty), field('经办人', row.user || row.inspector)];
}

function detailActions(module: WarehouseModule, editing: boolean): DetailAction[] {
  if (editing) return [{ key: 'save', label: '保存' }, { key: 'export', label: '导出' }];
  const actions: DetailAction[] = [{ key: 'edit', label: '编辑' }];
  if (['inbounds', 'outbounds', 'transfers', 'counts', 'outboundQuality'].includes(module)) actions.push({ key: 'approve', label: '审批/确认' });
  actions.push({ key: 'print', label: '打印' }, { key: 'export', label: '导出' });
  return actions;
}

function detailTabs(module: WarehouseModule): DetailTabItem[] {
  const map: Record<WarehouseModule, string[]> = {
    stocks: ['产品信息', '物码明细', '追溯链路', '库存流水', '占用冻结', '出库记录', '入库记录'],
    inbounds: ['入库信息', '物品明细', '物码绑定明细', '附件', '操作记录'],
    outbounds: ['出库信息', '物品明细', '拣货复核', 'OQC记录', '附件', '操作记录'],
    transfers: ['调拨信息', '物品明细', '调出确认', '调入确认', '操作记录'],
    counts: ['盘点信息', '物品明细', '差异调整', '附件', '操作记录'],
    outboundQuality: ['质检信息', '来源记录', '抽样记录', '检验明细', '不良处置', '复检记录', '放行/拒收记录', '质检报告'],
    locations: ['库位信息', '关联物码', '库存分布', '操作记录'],
  };
  return map[module].map((label) => ({ key: label, label }));
}

function renderDetailTab(module: WarehouseModule, detail: WarehouseDetail, tab: string, editing: boolean) {
  if (tab.includes('信息') || tab === '产品信息' || tab === '库位信息') return h('div', null, [
    h('div', { class: 'aw-section-title' }, tab),
    h(AwDetailInfoGrid, { items: detailFields(module, detail) }),
    editing ? h('div', { class: 'warehouse-edit-note' }, '编辑态：当前页面允许保存基础信息和明细 mock 更新。') : null,
  ]);
  if (tab === '附件' || tab === '质检报告') return renderAttachments(detail);
  if (tab === '操作记录') return renderSimpleTable(['操作时间', '操作人', '操作类型', '说明'], detail.records || []);
  if (tab === '库存流水') return renderSimpleTable(['来源单据', '来源明细', '业务类型', '方向', '批次', '库位', '质量状态', '成本层', '单位成本', '变动前', '变动数', '变动后', '状态'], detail.records || detail.lines || []);
  if (tab === '物码明细' || tab === '关联物码') return renderSimpleTable(['物品码', '父级/包装码', '码类型', '批次', '库位', '质量状态', '库存状态', '来源入库单', '最近业务', '绑定时间'], detail.lines || []);
  if (tab === '检验明细' || tab === '抽样记录') return renderSimpleTable(['检验项目名称', '检验方法', '检验值类型', '标准值', '上限', '下限', '样本号/实测值', '缺陷等级', '检验结论'], detail.lines || []);
  if (tab === '差异调整') return renderSimpleTable(['来源明细', '调整单号', '差异类型', '差异数量', '成本层', '处理方式', '审批状态', '过账结果', '库存释放'], detail.lines || []);
  if (tab === '追溯链路') return renderTraceTable();
  return renderSimpleTable(lineHeaders(module, tab), detail.lines || []);
}

function detailFields(module: WarehouseModule, row: WarehouseDetail): DetailFieldItem[] {
  if (module === 'stocks') {
    return [
      field('产品名称', row.name), field('产品编号', row.code), field('产品型号', row.model),
      field('产品分类', row.cat), field('产品单位', row.unit), field('默认仓库', row.wh),
      field('台账编号', row.ledgerNo), field('来源单据', row.sourceDoc), field('来源明细', row.sourceLine),
      field('质量状态', row.qualityState), field('成本层编号', row.costLayer), field('成本状态', row.costStatus),
      field('账面库存', row.stock), field('冻结数量', row.frozen), field('占用数量', row.occupied), field('可用数量', row.available),
    ];
  }
  if (module === 'counts') {
    return [field('盘点主题', row.subject), field('盘点编号', row.code), field('盘点仓库', row.wh), field('盘点范围', row.scope), field('锁库范围', row.lockScope), field('锁库数量', row.lockQty), field('是否锁库', row.locked), field('盘点日期', row.date), field('盘点人', row.user), field('盘点状态', row.state)];
  }
  if (module === 'outboundQuality') {
    return [field('出货检验主题', row.subject), field('OQC单号', row.code), field('销售/出库单', row.source), field('客户/产品', row.object), field('批次/样本', row.qty), field('OQC状态', row.state), field('质检方案', row.plan), field('关键控制点', row.critical)];
  }
  if (module === 'locations') {
    return [field('区域编号', row.code), field('区域名称', row.name), field('区域描述', row.desc), field('容量', row.capacity), field('所属仓库', row.warehouse), field('仓库负责人', row.manager), field('仓库地址', row.address), field('区域状态', row.state)];
  }
  const label = module === 'inbounds' ? '入库' : module === 'outbounds' ? '出库' : '调拨';
  return [
    field(`${label}主题`, row.subject), field(`${label}单号`, row.code), field(`${label}类别`, row.type),
    field(`${label}数量`, row.qty), field('申请日期', row.applyDate || row.date), field(`${label}人员`, row.user),
    field(`${label}日期`, row.date), field(`${label}状态`, row.state), field('来源对象', row.target || row.destination || `${row.fromWh} -> ${row.toWh}`),
  ];
}

function lineHeaders(module: WarehouseModule, tab: string) {
  if (module === 'transfers') return ['来源明细', '物品编码', '物品名称', '规格型号', '类型', '单位', '批次', '质量状态', '成本层', '当前库存', '可调拨量', '调拨冻结', '申请调拨', '调出确认', '调入确认', '差异数量', '原仓库', '原库位', '目标仓库', '目标库位', '备注'];
  if (module === 'outbounds') return ['来源单据', '来源明细', '物品编码', '物品名称', '规格型号', '单位', '批次号', '质量状态', '成本层', '推荐库位', '可用量', '应出数量', '拣货数量', '复核数量', '发货数量', 'OQC单号', '放行状态', '过账状态', '单价', '合计', '备注'];
  if (module === 'inbounds') return ['来源单据', '来源明细', '物品编码', '物品名称', '规格型号', '单位', '批次号', '应入库数量', '送检数量', '合格数量', '让步数量', '不合格数量', '入库数量', '上架数量', '入库库位', '质检单号', '状态', '库存质量', '成本层', '过账状态', '单价', '合计', '备注'];
  if (module === 'locations') return ['库位编号', '库位名称', '仓库', '负责人', '状态'];
  return tab.includes('出库') ? ['出库单号', '出库订单主题', '出库日期', '出库类型', '出库总量', '经办人', '仓库'] : ['入库单号', '入库订单主题', '入库日期', '入库类型', '入库总量', '经办人', '仓库'];
}

function renderSimpleTable(headers: string[], rows: AnyRow[]) {
  return h('table', { class: 'aw-table warehouse-detail-table' }, [
    h('thead', null, h('tr', null, [h('th', null, '序号'), ...headers.map((label) => h('th', { key: label }, label))])),
    h('tbody', null, normalizedRows(headers, rows).map((row, index) => h('tr', { key: row.id || index }, [
      h('td', null, index + 1),
      ...headers.map((label) => h('td', { key: label }, row[label] ?? '-')),
    ]))),
  ]);
}

function normalizedRows(headers: string[], rows: AnyRow[]) {
  if (!rows.length) return [{ id: 'empty' }];
  const keys = Object.keys(rows[0]).filter((key) => key !== 'id');
  return rows.map((row) => Object.fromEntries(headers.map((label, index) => [label, row[keys[index]] ?? row[label] ?? '-'])));
}

function renderTraceTable() {
  return renderSimpleTable(['时间', '环节', '单据', '码动作', '库位/对象', '结果'], [
    { id: 'trace_001', time: '2026-05-21 09:30', step: '入库', doc: 'RK-20251221001', action: '生成 15 个主码，绑定 2 个箱码', location: 'A区-A01-01', result: '完成' },
    { id: 'trace_002', time: '2026-05-21 10:10', step: '质检', doc: 'IQC-20251221008', action: '抽样码冻结', location: '质检暂存仓', result: '待复检' },
  ]);
}

function renderAttachments(detail: WarehouseDetail) {
  return h('div', { class: 'warehouse-attachments' }, (detail.attachments || []).map((item) => h('div', { class: 'warehouse-attachment', key: item.name }, [
    h('strong', null, item.name),
    h('span', null, `文件大小：${item.size}`),
    h('div', null, [h('span', { class: 'aw-link' }, '查看'), h('span', { class: 'aw-link' }, '下载')]),
  ])));
}
</script>

<style scoped>
.warehouse-thumb {
  display: inline-block;
  width: 44px;
  height: 30px;
  border-radius: 6px;
  background: #1f2937;
  box-shadow: inset 0 0 0 1px #4b5563;
}

.warehouse-toast,
.warehouse-feedback {
  margin-bottom: 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 9px 12px;
  font-size: 13px;
}

.warehouse-toast {
  position: fixed;
  right: 28px;
  top: 76px;
  z-index: 80;
  box-shadow: 0 8px 24px rgb(16 24 40 / 12%);
}

.warehouse-form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 14px 22px;
}

:global(.aw-form-page),
:global(.aw-form-card) {
  min-width: 0;
}

:global(.aw-form-card) {
  overflow: visible;
}

:global(.warehouse-create-line-table) {
  width: max-content;
  min-width: 2100px;
}

:global(.warehouse-create-line-wrap) {
  min-height: auto;
}

:global(.warehouse-create-line-wrap .aw-doc-tbl-inner) {
  max-height: none;
  overflow: auto;
}

:global(.warehouse-add-detail) {
  margin-top: 10px;
}

.warehouse-section-head,
.warehouse-actions,
.warehouse-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.warehouse-total {
  margin-top: 10px;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.warehouse-upload {
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  color: var(--aw-fg-3);
}

.aw-picker-input {
  width: 100%;
  height: 32px;
  border: 1px solid var(--aw-border);
  border-radius: 4px;
  background: #fff;
  text-align: left;
  padding: 0 10px;
  color: var(--aw-fg-2);
}

.aw-input.compact {
  min-width: 90px;
}

.aw-link-button {
  border: 0;
  background: transparent;
  color: var(--aw-primary);
  cursor: pointer;
}

.aw-link-button.danger {
  color: var(--aw-danger);
}

.warehouse-modal {
  width: min(980px, 94vw);
  max-height: 82vh;
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 80px rgb(16 24 40 / 18%);
}

.warehouse-modal-head,
.warehouse-modal-foot {
  padding: 14px 18px;
  border-bottom: 1px solid var(--aw-divider);
}

.warehouse-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.warehouse-modal-head button {
  border: 0;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}

.warehouse-modal-body {
  max-height: 58vh;
  overflow: auto;
  padding: 16px 18px;
}

.warehouse-modal-foot {
  border-top: 1px solid var(--aw-divider);
  border-bottom: 0;
  justify-content: flex-end;
}

.warehouse-modal-count {
  margin-right: auto;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.warehouse-attachments {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
}

.warehouse-attachment {
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  padding: 14px;
  min-height: 92px;
}

.warehouse-attachment span {
  display: block;
  margin-top: 8px;
  color: var(--aw-fg-3);
  font-size: 12px;
}

.warehouse-attachment div {
  display: flex;
  gap: 14px;
  margin-top: 12px;
}

.warehouse-edit-note {
  margin-top: 12px;
  color: var(--aw-fg-3);
  font-size: 13px;
}

.warehouse-detail-table {
  margin-top: 12px;
}

:global(.aw-warehouse-picker-modal) {
  width: min(980px, 94vw);
  max-height: 86vh;
}

:global(.aw-warehouse-picker-modal .body) {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 420px;
}

:global(.aw-warehouse-picker-modal .aw-doc-tbl-inner) {
  flex: 1;
  min-height: 0;
}

:global(.aw-warehouse-picker-modal .foot) {
  height: 54px;
  padding: 0 18px;
  border-top: 1px solid var(--aw-divider);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

:global(.aw-warehouse-picker-modal tr.picked) {
  background: var(--aw-primary-soft);
}

:global(.aw-picker-count) {
  color: var(--aw-primary);
  font-size: 13px;
  font-weight: 500;
}
</style>
