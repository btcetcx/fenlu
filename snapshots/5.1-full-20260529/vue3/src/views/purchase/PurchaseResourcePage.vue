<template>
  <purchase-setting-page v-if="settingModule" :module="settingModule" />
  <component :is="createComponent" v-else-if="isCreate" @back="goList" />
  <purchase-module-detail-entry v-else-if="isModuleDetailEntry" :module-key="moduleKey" @back="goList" />
  <purchase-detail-view v-else-if="detailId" :module-key="moduleKey" :id="detailId" @back="goList" />
  <aw-list-page v-else>
    <template v-if="moduleKey === 'suppliers'" #tree>
      <aw-resource-tree v-model="pickedTree" title="供应商库" :total="items.length" :nodes="supplierTreeNodes" />
    </template>

    <aw-list-toolbar
      :search-placeholder="moduleConfig.searchPlaceholder"
      :create-label="moduleConfig.createLabel"
      @search="keyword = $event"
      @refresh="loadData"
      @filter="noop"
      @columns="noop"
      @import="noop"
      @export="noop"
      @create="goCreate"
    />

    <aw-data-table
      :columns="moduleConfig.columns"
      :rows="tableRows"
      :row-key="'id'"
      :total="filteredItems.length"
      :bulk-actions="moduleConfig.bulkActions"
      :filter-values="columnFilters"
      @column-filter="setColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === moduleConfig.linkKey" class="aw-link" @click="openDetail(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'state'" :class="['aw-status', String(record.tone || '')]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openDetail(record.id as string)">查看</span>
        <span v-else>{{ value }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { approvePurchase, createPurchase, exportPurchase, getPurchaseDetail, inquirySources, listPurchase, orderSources, printPurchase, purchaseProducts, purchaseSuppliers, updatePurchase, type PurchaseModule, type PurchaseProduct, type PurchaseRow, type PurchaseSource } from '@/app/api/purchase/resources';
import type { PurchaseSettingModule } from '@/app/templates/purchase-settings-template';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';
import type { AwBulkAction, AwTableColumn, AwTreeNode } from '@/components/list-page/types';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { EditableColumn, FormAction } from '@/components/form-page/types';
import AwPersonPickerModal from '@/components/setting-page/AwPersonPickerModal.vue';
import PurchaseSettingPage from '@/views/purchase/shared/PurchaseSettingPage.vue';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailTabItem } from '@/components/detail-page/types';

type AnyRow = Record<string, any>;

interface ModuleConfig {
  title: string;
  searchPlaceholder: string;
  createLabel: string;
  columns: AwTableColumn[];
  linkKey: string;
  bulkActions: AwBulkAction[];
}

const route = useRoute();
const router = useRouter();
const items = ref<PurchaseRow[]>([]);
const keyword = ref('');
const pickedTree = ref('all');
const columnFilters = reactive<Record<string, string>>({});
const moduleKey = computed<PurchaseModule>(() => {
  if (route.path.endsWith('/purchase-requests')) return 'requests';
  if (route.path.endsWith('/purchase-inquiries')) return 'inquiries';
  if (route.path.endsWith('/purchase-orders')) return 'orders';
  return 'suppliers';
});
const settingModule = computed<PurchaseSettingModule | null>(() => route.query.setting ? moduleKey.value : null);
const isCreate = computed(() => route.query.action === 'new');
const moduleDetailActions = ['请购明细'];
const isModuleDetailEntry = computed(() => typeof route.query.action === 'string' && moduleDetailActions.includes(route.query.action));
const detailId = computed(() => typeof route.query.id === 'string' ? route.query.id : '');

const configs: Record<PurchaseModule, ModuleConfig> = {
  suppliers: {
    title: '供应商管理',
    searchPlaceholder: '全局搜索（如供应商、编号、联系人）',
    createLabel: '新增供应商',
    linkKey: 'name',
    bulkActions: [{ key: 'transfer', label: '批量转移' }, { key: 'assign', label: '批量指定' }],
    columns: [
      { key: 'code', title: '供应商编号', width: 140, link: true },
      { key: 'name', title: '供应商名称', width: 220, link: true },
      { key: 'type', title: '分类', width: 130, filterOptions: ['原材料供应商', '零部件供应商', '包装供应商', '服务供应商', '临时供应商'] },
      { key: 'category', title: '细分类', width: 120 },
      { key: 'contact', title: '联系人', width: 90 },
      { key: 'phone', title: '联系方式', width: 130 },
      { key: 'state', title: '状态', width: 100, filterOptions: ['临时', '已审核', '待审核', '已停用'] },
      { key: 'source', title: '来源', width: 160 },
      { key: 'date', title: '创建日期', width: 120 },
      { key: 'action', title: '操作', width: 80, fixed: 'right' },
    ],
  },
  requests: {
    title: '请购管理',
    searchPlaceholder: '全局搜索（如请购主题、编号、关联单据）',
    createLabel: '新增请购',
    linkKey: 'topic',
    bulkActions: [{ key: 'batch', label: '批量操作' }],
    columns: [
      { key: 'topic', title: '请购主题', width: 190, link: true },
      { key: 'code', title: '请购编号', width: 150 },
      { key: 'ref', title: '关联单据', width: 150 },
      { key: 'source', title: '请购来源', width: 130 },
      { key: 'starter', title: '发起人', width: 110 },
      { key: 'phone', title: '联系方式', width: 140 },
      { key: 'date', title: '申请日期', width: 120 },
      { key: 'printState', title: '打印状态', width: 100 },
      { key: 'state', title: '流程状态', width: 140, filterOptions: ['待提交', '审批中', '已批准', '待询价', '已转询价', '待采购', '已转采购', '部分采购', '已完成', '已关闭', '已驳回'] },
      { key: 'action', title: '操作', width: 80, fixed: 'right' },
    ],
  },
  inquiries: {
    title: '询价管理',
    searchPlaceholder: '全局搜索（如询价主题、编号、产品）',
    createLabel: '新增询价',
    linkKey: 'topic',
    bulkActions: [{ key: 'batch', label: '批量操作' }],
    columns: [
      { key: 'topic', title: '询价主题', width: 210, link: true },
      { key: 'code', title: '询价编号', width: 150 },
      { key: 'product', title: '询价产品', width: 160 },
      { key: 'qty', title: '询价数量', width: 100, numeric: true },
      { key: 'date', title: '询价日期', width: 120 },
      { key: 'deadline', title: '截止日期', width: 120 },
      { key: 'state', title: '询价状态', width: 130, filterOptions: ['询价中', '询价完毕', '待定价', '已定价', '作废'] },
      { key: 'action', title: '操作', width: 80, fixed: 'right' },
    ],
  },
  orders: {
    title: '采购订单',
    searchPlaceholder: '全局搜索（如采购编号、供应商、产品）',
    createLabel: '新增采购',
    linkKey: 'code',
    bulkActions: [{ key: 'batch', label: '批量操作' }],
    columns: [
      { key: 'code', title: '采购编号', width: 150, link: true },
      { key: 'supplier', title: '供应商', width: 170 },
      { key: 'summary', title: '产品概要', width: 130 },
      { key: 'date', title: '采购日期', width: 120 },
      { key: 'amount', title: '采购金额', width: 120 },
      { key: 'paid', title: '已付金额', width: 110 },
      { key: 'invoice', title: '到票金额', width: 110 },
      { key: 'match', title: '三单匹配', width: 110 },
      { key: 'provisional', title: '暂估应付', width: 110 },
      { key: 'certified', title: '发票认证', width: 100 },
      { key: 'deduction', title: '质检扣款', width: 110 },
      { key: 'payable', title: '可付款', width: 110 },
      { key: 'arrival', title: '预计到货', width: 120 },
      { key: 'state', title: '采购状态', width: 130, filterOptions: ['审核中', '采购中', '运输中', '待入库', '异常取消', '部分入库', '已完成'] },
      { key: 'action', title: '操作', width: 80, fixed: 'right' },
    ],
  },
};

const moduleConfig = computed(() => configs[moduleKey.value]);
const tableRows = computed(() => filteredItems.value.map((row) => ({ ...row, action: '查看' })));
const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const keywordMatched = !term || JSON.stringify(item).includes(term);
    const treeMatched = moduleKey.value !== 'suppliers' || pickedTree.value === 'all' || item.type === pickedTree.value || item.category === pickedTree.value;
    const filterMatched = Object.entries(columnFilters).every(([key, value]) => !value || item[key] === value);
    return keywordMatched && treeMatched && filterMatched;
  });
});
const supplierTreeNodes = computed<AwTreeNode[]>(() => {
  const counts = items.value.reduce<Record<string, number>>((acc, item) => {
    for (const key of [String(item.type || ''), String(item.category || '')]) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const groups = [
    ['原材料供应商', ['金属材料', '电子元器件', '化工材料']],
    ['零部件供应商', ['机械零件', '电气零件']],
    ['包装供应商', ['纸箱类', '塑料类']],
    ['服务供应商', ['物流服务', '检测服务']],
    ['临时供应商', ['询价新增', '待转正']],
  ];
  return [
    { key: 'all', label: '全部供应商', count: items.value.length, icon: 'line-users', level: 2, open: true },
    ...groups.flatMap(([group, kids]) => [
      { key: group as string, label: group as string, count: counts[group as string] || 0, icon: 'line-folder', level: 2 as const, open: true },
      ...(kids as string[]).map((kid) => ({ key: kid, label: kid, count: counts[kid] || 0, icon: 'line-node', level: 3 as const })),
    ]),
  ];
});
const createComponent = computed(() => ({
  suppliers: SupplierCreate,
  requests: RequestCreate,
  inquiries: InquiryCreate,
  orders: OrderCreate,
})[moduleKey.value]);

watch(() => route.fullPath, () => {
  if (settingModule.value || isCreate.value || isModuleDetailEntry.value) return;
  keyword.value = '';
  pickedTree.value = 'all';
  Object.keys(columnFilters).forEach((key) => delete columnFilters[key]);
  loadData();
}, { immediate: true });

async function loadData() {
  const result = await listPurchase(moduleKey.value, { pageNo: 1, pageSize: 50 });
  items.value = result.items;
}

function setColumnFilter(key: string, value: string) {
  columnFilters[key] = value;
}

function goCreate() {
  router.push({ path: route.path, query: { action: 'new' } });
}

function goList() {
  router.push({ path: route.path });
}

function openDetail(id: string) {
  router.push({ path: route.path, query: { id } });
}

function noop() {}

function formatMoney(value: unknown) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const baseActions: FormAction[] = [
  { key: 'draft', label: '暂存' },
  { key: 'reset', label: '重置' },
  { key: 'submit', label: '提交审批', primary: true },
];

const personDepts = [
  { key: 'purchase', label: '采购中心', persons: [
    { id: 'CG001', name: '老夏', role: '采购主管', phone: '13800000001', dept: '采购中心' },
    { id: 'CG002', name: '李文涛', role: '采购员', phone: '13800000002', dept: '采购中心' },
    { id: 'CG003', name: '陈思源', role: '采购员', phone: '13800000003', dept: '采购中心' },
  ] },
  { key: 'finance', label: '财务中心', persons: [{ id: 'CW001', name: '顾伦', role: '应付会计', phone: '13900000001', dept: '财务中心' }] },
];

const ProductPickerModal = defineComponent({
  props: { open: Boolean, supplierName: String },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const picked = ref<string[]>([]);
    const rows = computed(() => props.supplierName ? purchaseProducts.filter((row) => row.supplier === props.supplierName) : purchaseProducts);
    const toggle = (id: string) => picked.value = picked.value.includes(id) ? picked.value.filter((item) => item !== id) : [...picked.value, id];
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal aw-purchase-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [h('span', '选择产品'), h('button', { class: 'aw-modal-close', onClick: () => emit('cancel') }, '×')]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-picker-count' }, `已勾选 ${picked.value.length} 项`),
          h('div', { class: 'aw-doc-tbl-inner' }, [h('table', { class: 'aw-doc-tbl' }, [
            h('thead', [h('tr', ['','产品编号','产品名称','规格型号','产品分类','单位','采购单价','库存','默认供应商'].map((title) => h('th', title)))]),
            h('tbody', rows.value.map((row) => h('tr', { class: picked.value.includes(row.id) ? 'picked' : '', onClick: () => toggle(row.id) }, [
              h('td', [h('input', { type: 'checkbox', checked: picked.value.includes(row.id) })]),
              h('td', { class: 'aw-num' }, row.productNo),
              h('td', { class: 'aw-link' }, row.productName),
              h('td', row.model),
              h('td', row.categoryName),
              h('td', row.unit),
              h('td', formatMoney(row.price)),
              h('td', String(row.stock ?? '')),
              h('td', row.supplier),
            ]))),
          ])]),
        ]),
        h('div', { class: 'foot' }, [h('button', { class: 'aw-btn', onClick: () => emit('cancel') }, '取消'), h('button', { class: 'aw-btn primary', onClick: () => emit('confirm', rows.value.filter((row) => picked.value.includes(row.id))) }, '确定')]),
      ]),
    ]) : null;
  },
});

const SupplierPickerModal = defineComponent({
  props: { open: Boolean },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const selected = ref(purchaseSuppliers[0].id);
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal aw-purchase-modal small', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [h('span', '选择供应商'), h('button', { class: 'aw-modal-close', onClick: () => emit('cancel') }, '×')]),
        h('div', { class: 'body' }, [h('table', { class: 'aw-doc-tbl' }, [
          h('thead', [h('tr', ['','供应商名称','等级','联系人','联系电话'].map((title) => h('th', title)))]),
          h('tbody', purchaseSuppliers.map((row) => h('tr', { class: selected.value === row.id ? 'picked' : '', onClick: () => selected.value = row.id }, [
            h('td', [h('input', { type: 'radio', checked: selected.value === row.id })]),
            h('td', { class: 'aw-link' }, row.name),
            h('td', row.level),
            h('td', row.contact),
            h('td', row.phone),
          ]))),
        ])]),
        h('div', { class: 'foot' }, [h('button', { class: 'aw-btn', onClick: () => emit('cancel') }, '取消'), h('button', { class: 'aw-btn primary', onClick: () => emit('confirm', purchaseSuppliers.find((row) => row.id === selected.value)) }, '确定')]),
      ]),
    ]) : null;
  },
});

const SourcePickerModal = defineComponent({
  props: { open: Boolean, kind: { type: String, default: 'inquiry' } },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const type = ref(props.kind === 'order' ? '请购' : '请购明细');
    const selectedId = ref('');
    const sourceRows = computed(() => props.kind === 'order' ? orderSources : inquirySources);
    const sourceTypes = computed(() => props.kind === 'order' ? ['请购', '询价', 'MRP采购建议'] : ['请购明细', '采购计划', '库存补货']);
    const rows = computed(() => sourceRows.value.filter((row) => row.type === type.value));
    watch(() => props.open, () => { type.value = props.kind === 'order' ? '请购' : '请购明细'; selectedId.value = ''; });
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal aw-purchase-modal', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [h('span', props.kind === 'order' ? '选择订单来源' : '选择询价来源'), h('button', { class: 'aw-modal-close', onClick: () => emit('cancel') }, '×')]),
        h('div', { class: 'body aw-source-picker' }, [
          h('aside', sourceTypes.value.map((item) => h('button', { class: type.value === item ? 'on' : '', onClick: () => { type.value = item; selectedId.value = ''; } }, `${item}${props.kind === 'order' ? '列表' : ''}`))),
          h('div', { class: 'aw-doc-tbl-inner' }, [h('table', { class: 'aw-doc-tbl' }, [
            h('thead', [h('tr', ['', '来源编号', '来源主题', props.kind === 'order' ? '建议供应商' : '来源日期', props.kind === 'order' ? '单据日期' : '产品数', props.kind === 'order' ? '产品数' : ''].filter(Boolean).map((title) => h('th', title)))]),
            h('tbody', rows.value.map((row) => h('tr', { class: selectedId.value === row.id ? 'picked' : '', onClick: () => selectedId.value = row.id }, [
              h('td', [h('input', { type: 'radio', checked: selectedId.value === row.id })]),
              h('td', { class: 'aw-num' }, row.code),
              h('td', { class: 'aw-link' }, row.title),
              h('td', props.kind === 'order' ? String(row.supplier || '') : row.date),
              h('td', props.kind === 'order' ? row.date : String(row.products.length)),
              ...(props.kind === 'order' ? [h('td', String(row.products.length))] : []),
            ]))),
          ])]),
        ]),
        h('div', { class: 'foot' }, [h('button', { class: 'aw-btn', onClick: () => emit('cancel') }, '取消'), h('button', { class: 'aw-btn primary', onClick: () => emit('confirm', sourceRows.value.find((row) => row.id === selectedId.value)) }, '确定')]),
      ]),
    ]) : null;
  },
});

const SupplierReasonModal = defineComponent({
  props: { open: Boolean, supplierName: String },
  emits: ['cancel', 'confirm'],
  setup(props, { emit }) {
    const reason = ref('');
    return () => props.open ? h('div', { class: 'aw-mask', onClick: () => emit('cancel') }, [
      h('div', { class: 'aw-modal aw-purchase-modal small', onClick: (event: Event) => event.stopPropagation() }, [
        h('div', { class: 'head' }, [h('span', '更换供应商提醒'), h('button', { class: 'aw-modal-close', onClick: () => emit('cancel') }, '×')]),
        h('div', { class: 'body' }, [
          h('div', { class: 'aw-form-note' }, `当前供应商：${props.supplierName || '未选择'}。更换供应商会触发审核流程，请填写更换理由后继续选择新的供应商。`),
          h('div', { class: 'aw-field' }, [h('label', { class: 'req' }, '更换理由'), h('textarea', { class: 'aw-input reason-area', value: reason.value, placeholder: '请输入更换供应商的原因', onInput: (event: Event) => reason.value = (event.target as HTMLTextAreaElement).value })]),
        ]),
        h('div', { class: 'foot' }, [h('button', { class: 'aw-btn', onClick: () => emit('cancel') }, '取消'), h('button', { class: 'aw-btn primary', onClick: () => reason.value.trim() && emit('confirm', reason.value.trim()) }, '确定')]),
      ]),
    ]) : null;
  },
});

const SupplierCreate = defineComponent({
  emits: ['back'],
  setup(_, { emit }) {
    const form = reactive({ name: '', pinyin: '', type: '', supplierType: '正式供应商', source: '', creditCode: '', buyer: '' });
    const tab = ref('product');
    const productRows = ref<AnyRow[]>([]);
    const contactRows = ref<AnyRow[]>([{ id: 1, isDefault: true }]);
    const financeRows = ref<AnyRow[]>([{ id: 1, isDefault: true }]);
    const addressRows = ref<AnyRow[]>([{ id: 1, isDefault: true, addressType: '收货地址' }]);
    const message = ref('');
    const showProduct = ref(false);
    const showPerson = ref(false);
    const pickedPeople = ref<any[]>([]);
    const detail = ref('');
    const addProducts = (rows: PurchaseProduct[]) => { productRows.value.push(...rows.map((row, index) => ({ ...row, id: `${row.id}-${Date.now()}-${index}`, supplyUnit: row.unit, ratio: 1, brand: '通用' }))); showProduct.value = false; };
    const submit = async (key: string) => {
      if (key === 'reset') { productRows.value = []; contactRows.value = [{ id: 1, isDefault: true }]; message.value = '已重置。'; return; }
      await createPurchase('suppliers', { ...form, buyer: form.buyer, products: productRows.value, contacts: contactRows.value, finances: financeRows.value, addresses: addressRows.value, detail });
      message.value = key === 'draft' ? '供应商草稿已通过新增接口保存。' : '供应商已通过新增接口提交审批。';
    };
    return () => h(AwFormPage, { actions: baseActions, onBack: () => emit('back'), onAction: submit }, () => [
      section('基础信息', h('div', { class: 'aw-form-grid' }, [
        field('供应商名称', h('input', { class: 'aw-input', value: form.name, placeholder: '请输入供应商全称', onInput: (e: Event) => form.name = val(e) }), true),
        field('拼音号', h('input', { class: 'aw-input', value: form.pinyin, placeholder: '根据名称自动生成，可手动修改', onInput: (e: Event) => form.pinyin = val(e) })),
        field('供应商编号', h('input', { class: 'aw-input', value: '系统自动生成', disabled: true })),
        field('供应商分类', select(['请选择供应商所属分类', '原材料供应商', '零部件供应商', '包装供应商', '服务供应商', '临时供应商'], form.type, (v) => form.type = v), true),
        field('供应商类型', select(['正式供应商', '临时供应商'], form.supplierType, (v) => form.supplierType = v), true),
        field('来源单据', h('input', { class: 'aw-input', value: form.source, placeholder: '临时供应商自动带出来源询价单', onInput: (e: Event) => form.source = val(e) })),
        field('信用代码', h('input', { class: 'aw-input', value: form.creditCode, placeholder: '请输入18位统一社会信用代码', onInput: (e: Event) => form.creditCode = val(e) }), true),
        field('采购人员', h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: form.buyer, readonly: true, placeholder: '点击右侧按钮选择采购人员' }), h('button', { class: 'aw-tool-btn', onClick: () => showPerson.value = true }, '选择')]), false),
      ])),
      section('供应商详情', [
        tabs(tab, [['product', '供应产品'], ['contact', '联系人信息'], ['finance', '财务信息'], ['address', '地址信息'], ['attach', '附件信息']]),
        tab.value === 'product' ? h(AwEditableSubTable, { columns: productColumns, rows: productRows.value, addText: '新增供应产品', onAdd: () => showProduct.value = true }, tableSlots({ delete: (row: AnyRow) => productRows.value = productRows.value.filter((item) => item.id !== row.id) })) : null,
        tab.value === 'contact' ? editableRows(contactRows, contactColumns, '新增联系人') : null,
        tab.value === 'finance' ? editableRows(financeRows, financeColumns, '新增银行卡号') : null,
        tab.value === 'address' ? editableRows(addressRows, addressColumns, '新增地址') : null,
        tab.value === 'attach' ? h('div', { class: 'aw-upload-card' }, [h('span', { class: 'aw-link' }, '点击上传'), ' / 拖拽到此区域 支持 PDF、Word、Excel、JPG、PNG，单文件不超过 20MB']) : null,
      ]),
      section('供应商详情说明', h(AwRichTextEditor, { modelValue: detail.value, 'onUpdate:modelValue': (v: string) => detail.value = v, placeholder: '请输入供应商介绍、资质能力、合作说明、风险备注等详情内容' })),
      message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
      h(ProductPickerModal, { open: showProduct.value, onCancel: () => showProduct.value = false, onConfirm: addProducts }),
      h(AwPersonPickerModal, { open: showPerson.value, title: '选择采购人员', depts: personDepts, picked: pickedPeople.value, onCancel: () => showPerson.value = false, onConfirm: (people: any[]) => { pickedPeople.value = people.slice(0, 1); form.buyer = pickedPeople.value.map((p) => p.name).join('、'); showPerson.value = false; } }),
    ]);
  },
});

const RequestCreate = defineComponent({
  emits: ['back'],
  setup(_, { emit }) {
    const form = reactive({ topic: '', source: '', ref: '', requestDate: '自动', needDate: '' });
    const rows = ref<AnyRow[]>([]);
    const showProduct = ref(false);
    const supplierTarget = ref('');
    const message = ref('');
    const detail = ref('');
    const addProducts = (products: PurchaseProduct[]) => { rows.value.push(...products.map((p, i) => ({ ...p, id: `${p.id}-${Date.now()}-${i}`, qty: '', date: '', usage: '', supplier: p.supplier }))); showProduct.value = false; };
    const submit = async (key: string) => {
      if (key === 'reset') { rows.value = []; message.value = '已重置。'; return; }
      await createPurchase('requests', { ...form, rows: rows.value, detail: detail.value });
      message.value = key === 'draft' ? '请购草稿已通过新增接口保存。' : '请购已通过新增接口提交审批。';
    };
    return () => h(AwFormPage, { actions: baseActions, onBack: () => emit('back'), onAction: submit }, () => [
      section('基础信息', h('div', { class: 'aw-form-grid' }, [
        field('请购主题', h('input', { class: 'aw-input', value: form.topic, placeholder: '填写请购主题', onInput: (e: Event) => form.topic = val(e) }), true),
        field('请购编号', h('input', { class: 'aw-input', value: '自动生成', disabled: true })),
        field('请购来源', select(['请选择', '项目请购', '生产缺料', '库存补货', '研发试制'], form.source, (v) => form.source = v), true),
        field('关联单据', h('input', { class: 'aw-input', value: form.ref, placeholder: '填写或选择关联单据', onInput: (e: Event) => form.ref = val(e) })),
        field('请购日期', h('input', { class: 'aw-input', value: form.requestDate, onInput: (e: Event) => form.requestDate = val(e) }), true),
        field('需求日期', h('input', { class: 'aw-input', value: form.needDate, placeholder: '请选择', onInput: (e: Event) => form.needDate = val(e) })),
        field('流程状态', h('input', { class: 'aw-input', value: '待提交', readonly: true })),
      ])),
      section('请购明细', [h(AwEditableSubTable, { columns: requestLineColumns, rows: rows.value, addText: '新增明细', onAdd: () => showProduct.value = true }, tableSlots({ supplier: (row: AnyRow) => supplierTarget.value = row.id, delete: (row: AnyRow) => rows.value = rows.value.filter((item) => item.id !== row.id) })), totalBar([['请购总数量', rows.value.reduce((sum, row) => sum + Number(row.qty || 0), 0)]])]),
      section('请购备注', h(AwRichTextEditor, { modelValue: detail.value, 'onUpdate:modelValue': (v: string) => detail.value = v })),
      message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
      h(ProductPickerModal, { open: showProduct.value, onCancel: () => showProduct.value = false, onConfirm: addProducts }),
      h(SupplierPickerModal, { open: Boolean(supplierTarget.value), onCancel: () => supplierTarget.value = '', onConfirm: (supplier: any) => { rows.value = rows.value.map((row) => row.id === supplierTarget.value ? { ...row, supplier: supplier.name } : row); supplierTarget.value = ''; } }),
    ]);
  },
});

const InquiryCreate = defineComponent({
  emits: ['back'],
  setup(_, { emit }) {
    const form = reactive({ topic: '', deadline: '' });
    const rows = ref<AnyRow[]>([]);
    const showProduct = ref(false);
    const showSource = ref(false);
    const message = ref('');
    const detail = ref('');
    const addInquiryRows = (products: PurchaseProduct[]) => {
      rows.value.push(...products.map((p, i) => ({ ...p, id: `${p.id}-${Date.now()}-${i}`, qty: '', suppliers: formalSuppliers(p) })));
      showProduct.value = false;
    };
    const applySource = (source: PurchaseSource) => {
      form.topic = source.title;
      rows.value = source.products.map((p, i) => ({ ...p, id: `${source.id}-${i}`, sourceDoc: source.code, qty: p.qty || '', suppliers: formalSuppliers(p) }));
      showSource.value = false;
    };
    const submit = async (key: string) => {
      if (key === 'reset') { rows.value = []; message.value = '已重置。'; return; }
      await createPurchase('inquiries', { ...form, rows: rows.value, detail: detail.value });
      message.value = key === 'draft' ? '询价草稿已通过新增接口保存。' : '询价已通过新增接口提交审批。';
    };
    return () => h(AwFormPage, { actions: baseActions, onBack: () => emit('back'), onAction: submit }, () => [
      section('基础信息', h('div', { class: 'aw-form-grid' }, [
        field('询价主题', h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: form.topic, placeholder: '手动输入询价主题', onInput: (e: Event) => form.topic = val(e) }), h('button', { class: 'aw-tool-btn', onClick: () => showSource.value = true }, '选择询价来源')]), true),
        field('询价编号', h('input', { class: 'aw-input', value: '自动生成', disabled: true })),
        field('截止日期', h('input', { class: 'aw-input', value: form.deadline, placeholder: '请选择', onInput: (e: Event) => form.deadline = val(e) })),
      ])),
      section('询价明细', [
        h('div', { class: 'aw-doc-tbl-wrap' }, [h('div', { class: 'aw-doc-tbl-inner' }, [h('table', { class: 'aw-doc-tbl inquiry-table' }, [
          h('thead', [h('tr', ['序号','产品名称','产品编号','产品型号','产品分类','标准单位','数量','来源明细','供应商','供应商类型','报价版本','单价','是否含税','折扣','金额','税额','交货期','最小采购量','采购生成','操作'].map((t) => h('th', t)))]),
          h('tbody', rows.value.length ? rows.value.flatMap((row, index) => [
            h('tr', { class: 'summary' }, [h('td', index + 1), h('td', row.productName), h('td', row.productNo), h('td', row.model), h('td', row.categoryName), h('td', row.unit), h('td', [h('input', { class: 'aw-input', value: row.qty, onInput: (e: Event) => row.qty = val(e) })]), h('td', row.sourceDoc || '-'), h('td', { colspan: 11 }, [h('span', { class: 'aw-link', onClick: () => row.suppliers.push(tempSupplier(row)) }, '+ 新增供应商')]), h('td', [h('span', { class: 'aw-link danger', onClick: () => rows.value = rows.value.filter((item) => item.id !== row.id) }, '删除')])]),
            ...row.suppliers.map((supplier: AnyRow, sIndex: number) => h('tr', [h('td'), h('td'), h('td'), h('td'), h('td'), h('td'), h('td'), h('td', `${sIndex + 1} / ${supplier.sourceLine}`), h('td', [h('input', { class: 'aw-input', value: supplier.supplier, placeholder: '选择供应商', onInput: (e: Event) => supplier.supplier = val(e) })]), h('td', supplier.temp ? '临时供应商' : '正式供应商'), h('td', [h('input', { class: 'aw-input', value: supplier.quoteVersion, onInput: (e: Event) => supplier.quoteVersion = val(e) })]), h('td', [h('input', { class: 'aw-input', value: supplier.price, onInput: (e: Event) => { supplier.price = val(e); calcQuote(row, supplier); } })]), h('td', select(['是', '否'], supplier.taxed, (v) => supplier.taxed = v)), h('td', [h('input', { class: 'aw-input', value: supplier.discount, onInput: (e: Event) => supplier.discount = val(e) })]), h('td', supplier.amount), h('td', supplier.tax), h('td', [h('input', { class: 'aw-input', value: supplier.delivery, onInput: (e: Event) => supplier.delivery = val(e) })]), h('td', [h('input', { class: 'aw-input', value: supplier.minQty, onInput: (e: Event) => supplier.minQty = val(e) })]), h('td', '待定价'), h('td', [h('span', { class: 'aw-link danger', onClick: () => row.suppliers = row.suppliers.filter((item: AnyRow) => item.id !== supplier.id) }, '删除')])]))
          ]) : [h('tr', [h('td', { colspan: 20, class: 'aw-empty' }, '暂无询价明细，点击“新增明细”选择产品')])]),
        ])])]),
        h('button', { class: 'aw-tool-btn', onClick: () => showProduct.value = true }, '新增明细'),
      ]),
      section('询价备注', h(AwRichTextEditor, { modelValue: detail.value, 'onUpdate:modelValue': (v: string) => detail.value = v })),
      message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
      h(ProductPickerModal, { open: showProduct.value, onCancel: () => showProduct.value = false, onConfirm: addInquiryRows }),
      h(SourcePickerModal, { open: showSource.value, kind: 'inquiry', onCancel: () => showSource.value = false, onConfirm: applySource }),
    ]);
  },
});

const OrderCreate = defineComponent({
  emits: ['back'],
  setup(_, { emit }) {
    const form = reactive({ topic: '', supplier: '', sourceText: '手动输入', date: '自动', arrival: '' });
    const source = ref<PurchaseSource | null>(null);
    const rows = ref<AnyRow[]>([]);
    const showSource = ref(false);
    const showSupplier = ref(false);
    const showProduct = ref(false);
    const reasonTarget = ref('');
    const pickerTarget = ref('');
    const message = ref('');
    const detail = ref('');
    const applySource = (picked: PurchaseSource) => {
      source.value = picked;
      form.topic = picked.title;
      form.supplier = picked.supplier || '';
      form.sourceText = `${picked.type} / ${picked.code}`;
      rows.value = picked.products.map((p, i) => ({ ...p, id: `${picked.id}-${i}`, qty: p.qty || '', waitPurchaseQty: p.waitPurchaseQty || p.qty || '', amount: p.amount || Number(p.qty || 0) * Number(p.price || 0) }));
      showSource.value = false;
    };
    const addProducts = (products: PurchaseProduct[]) => {
      rows.value.push(...products.map((p, i) => ({ ...p, id: `manual-${Date.now()}-${i}`, sourceLine: '手动', priceSource: '手动定价', qty: '', waitPurchaseQty: '', amount: 0, supplier: form.supplier || p.supplier })));
      showProduct.value = false;
    };
    const submit = async (key: string) => {
      if (key === 'reset') { rows.value = []; source.value = null; message.value = '已重置。'; return; }
      await createPurchase('orders', { ...form, rows: rows.value, detail: detail.value, amount: totalAmount(rows.value) });
      message.value = key === 'draft' ? '采购订单草稿已通过新增接口保存。' : '采购订单已通过新增接口提交审批。';
    };
    const confirmSupplier = (supplier: any) => {
      if (pickerTarget.value) {
        rows.value = rows.value.map((row) => row.id === pickerTarget.value ? { ...row, supplier: supplier.name, supplierChanged: true } : row);
        pickerTarget.value = '';
      } else {
        form.supplier = supplier.name;
        rows.value = [];
        showSupplier.value = false;
      }
    };
    return () => h(AwFormPage, { actions: baseActions, onBack: () => emit('back'), onAction: submit }, () => [
      section('基础信息', [
        h('div', { class: 'aw-form-grid' }, [
          field('订单主题', h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: form.topic, placeholder: '手动输入订单主题', onInput: (e: Event) => form.topic = val(e) }), h('button', { class: 'aw-tool-btn', onClick: () => showSource.value = true }, '选择订单来源')]), true),
          field('采购编号', h('input', { class: 'aw-input', value: '自动生成', disabled: true })),
          field('订单来源', h('input', { class: 'aw-input', value: form.sourceText, readonly: true })),
          field('供应商', h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: form.supplier, readonly: true, placeholder: '请选择供应商' }), h('button', { class: 'aw-tool-btn', onClick: () => showSupplier.value = true }, '选择供应商')]), true),
          field('采购日期', h('input', { class: 'aw-input', value: form.date, onInput: (e: Event) => form.date = val(e) }), true),
          field('预计到货', h('input', { class: 'aw-input', value: form.arrival, placeholder: '请选择', onInput: (e: Event) => form.arrival = val(e) })),
          field('采购状态', h('input', { class: 'aw-input', value: '审核中', readonly: true })),
        ]),
        h('div', { class: 'aw-form-note' }, '采购来源受采购策略控制：可从请购、询价定价、MRP采购建议带入明细；手动采购会记录为手动来源。'),
      ]),
      section('采购明细', [
        h(AwEditableSubTable, { columns: orderLineColumns, rows: rows.value, addText: '新增明细', onAdd: () => form.supplier && (showProduct.value = true) }, {
          cell: ({ column, row }: any) => orderCell(column.key, row, (id: string) => reasonTarget.value = id),
          actions: ({ row }: any) => h('span', { class: 'aw-link danger', onClick: () => rows.value = rows.value.filter((item) => item.id !== row.id) }, '删除'),
        }),
        rows.value.length ? totalBar([['本次采购数量', rows.value.reduce((sum, row) => sum + Number(row.qty || 0), 0)], ['本次采购金额', formatMoney(totalAmount(rows.value))]]) : h('div', { class: 'aw-empty' }, form.supplier ? '暂无采购明细，可选择订单来源自动带入，或新增明细' : '请先选择供应商'),
      ]),
      section('采购备注', h(AwRichTextEditor, { modelValue: detail.value, 'onUpdate:modelValue': (v: string) => detail.value = v })),
      section('来源与定价说明', h('div', { class: 'aw-form-note' }, '来源明细用于回写请购/询价的已采购数量；从询价生成采购时，采购明细必须保留定价供应商、报价版本和定价记录。')),
      message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
      h(SourcePickerModal, { open: showSource.value, kind: 'order', onCancel: () => showSource.value = false, onConfirm: applySource }),
      h(SupplierPickerModal, { open: showSupplier.value || Boolean(pickerTarget.value), onCancel: () => { showSupplier.value = false; pickerTarget.value = ''; }, onConfirm: confirmSupplier }),
      h(ProductPickerModal, { open: showProduct.value, supplierName: form.supplier, onCancel: () => showProduct.value = false, onConfirm: addProducts }),
      h(SupplierReasonModal, { open: Boolean(reasonTarget.value), supplierName: rows.value.find((row) => row.id === reasonTarget.value)?.supplier, onCancel: () => reasonTarget.value = '', onConfirm: (reason: string) => { rows.value = rows.value.map((row) => row.id === reasonTarget.value ? { ...row, supplierChangeReason: reason } : row); pickerTarget.value = reasonTarget.value; reasonTarget.value = ''; } }),
    ]);
  },
});

const productColumns: EditableColumn[] = [
  { key: 'productNo', title: '物料编码', width: 130 }, { key: 'productName', title: '物料名称', width: 160 }, { key: 'model', title: '规格型号', width: 130 }, { key: 'categoryName', title: '物料类别', width: 130 }, { key: 'brand', title: '品牌', width: 100 }, { key: 'unit', title: '标准单位', width: 90 }, { key: 'supplyUnit', title: '供货单位', width: 100 }, { key: 'ratio', title: '换算系数', width: 100 },
];
const contactColumns: EditableColumn[] = [{ key: 'name', title: '联系人' }, { key: 'phone', title: '联系方式' }, { key: 'position', title: '职位' }, { key: 'email', title: '邮箱' }, { key: 'remark', title: '备注' }];
const financeColumns: EditableColumn[] = [{ key: 'bankAccount', title: '银行卡号' }, { key: 'accountName', title: '账户名称' }, { key: 'bankName', title: '开户行' }, { key: 'accountType', title: '账户类型' }, { key: 'remark', title: '备注' }];
const addressColumns: EditableColumn[] = [{ key: 'addressType', title: '地址类型' }, { key: 'contact', title: '收件人' }, { key: 'phone', title: '联系电话' }, { key: 'address', title: '详细地址' }];
const requestLineColumns: EditableColumn[] = [{ key: 'productName', title: '产品名称', width: 150 }, { key: 'productNo', title: '产品编号', width: 130 }, { key: 'model', title: '产品型号', width: 130 }, { key: 'categoryName', title: '产品分类', width: 130 }, { key: 'unit', title: '产品单位', width: 90 }, { key: 'qty', title: '请购数量', width: 110 }, { key: 'date', title: '交货日期', width: 120 }, { key: 'supplier', title: '建议供应商', width: 150 }, { key: 'usage', title: '用途说明', width: 150 }];
const orderLineColumns: EditableColumn[] = [{ key: 'sourceLine', title: '来源明细', width: 150 }, { key: 'priceSource', title: '价格来源', width: 170 }, { key: 'productName', title: '产品名称', width: 150 }, { key: 'productNo', title: '产品编号', width: 130 }, { key: 'model', title: '产品型号', width: 130 }, { key: 'categoryName', title: '产品分类', width: 130 }, { key: 'unit', title: '产品单位', width: 90 }, { key: 'qty', title: '采购数量', width: 110 }, { key: 'waitPurchaseQty', title: '待采购', width: 100 }, { key: 'price', title: '采购单价', width: 100 }, { key: 'amount', title: '采购金额', width: 110 }, { key: 'arrival', title: '预计到货', width: 120 }, { key: 'supplier', title: '供应商', width: 170 }];

function section(title: string, children: any) {
  return h('section', { class: 'aw-form-card' }, [h('div', { class: 'aw-detail-section-title' }, title), children]);
}
function field(label: string, child: any, required = false) {
  return h('div', { class: 'aw-field' }, [h('label', { class: required ? 'req' : '' }, label), child]);
}
function select(options: string[], value: string, onChange: (value: string) => void) {
  return h('select', { class: 'aw-select', value, onChange: (event: Event) => onChange(val(event)) }, options.map((option) => h('option', { value: option === '请选择' ? '' : option }, option)));
}
function val(event: Event) {
  return (event.target as HTMLInputElement).value;
}
function tabs(active: any, items: string[][]) {
  return h('div', { class: 'aw-detail-tabs' }, items.map(([key, label]) => h('button', { class: ['aw-detail-tab', { on: active.value === key }], type: 'button', onClick: () => active.value = key }, label)));
}
function tableSlots(options: { supplier?: (row: AnyRow) => void; delete: (row: AnyRow) => void }) {
  return {
    cell: ({ column, row }: any) => {
      if (column.key === 'supplier') return h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: row.supplier || '', readonly: true, placeholder: '请选择供应商' }), h('button', { class: 'aw-tool-btn mini', onClick: () => options.supplier?.(row) }, '选')]);
      if (column.key === 'unit' || column.key === 'productNo' || column.key === 'categoryName') return h('input', { class: 'aw-input readonly', value: row[column.key] || '', readonly: true });
      return h('input', { class: 'aw-input', value: row[column.key] || '', onInput: (e: Event) => row[column.key] = val(e) });
    },
    actions: ({ row }: any) => h('span', { class: 'aw-link danger', onClick: () => options.delete(row) }, '删除'),
  };
}
function editableRows(rows: any, columns: EditableColumn[], addText: string) {
  return h(AwEditableSubTable, { columns, rows: rows.value, addText, onAdd: () => rows.value.push({ id: Date.now() }) }, tableSlots({ delete: (row) => rows.value = rows.value.filter((item: AnyRow) => item.id !== row.id) }));
}
function formalSuppliers(product: PurchaseProduct) {
  const names = [product.supplier || '深圳鑫达电子科技有限公司', '广州宏业机械配件有限公司'];
  return names.map((supplier, index) => ({ id: `${product.productNo}-${index}`, sourceLine: '供应商档案', quoteVersion: `V${index + 1}`, supplier, temp: false, price: '', taxed: '是', discount: '', amount: '', tax: '', delivery: '', minQty: '' }));
}
function tempSupplier(row: AnyRow) {
  return { id: `${row.id}-temp-${Date.now()}`, sourceLine: '临时供应商', quoteVersion: `V${row.suppliers.length + 1}`, supplier: '', temp: true, price: '', taxed: '是', discount: '', amount: '', tax: '', delivery: '', minQty: '' };
}
function calcQuote(row: AnyRow, supplier: AnyRow) {
  const amount = Number(row.qty || 0) * Number(supplier.price || 0);
  supplier.amount = amount ? amount.toFixed(2) : '';
  supplier.tax = supplier.taxed === '是' && amount ? (amount * 0.13).toFixed(2) : '0.00';
}
function orderCell(key: string, row: AnyRow, onSupplierChange: (id: string) => void) {
  if (key === 'sourceLine' || key === 'priceSource' || key === 'waitPurchaseQty') return h('span', row[key] || (key === 'sourceLine' ? '手动' : ''));
  if (key === 'supplier') return h('div', [h('div', { class: 'aw-field-row' }, [h('input', { class: 'aw-input', value: row.supplier || '', readonly: true }), h('button', { class: 'aw-tool-btn mini', onClick: () => onSupplierChange(row.id) }, '更换')]), row.supplierChanged ? h('div', { class: 'aw-warning-line' }, '已触发审核') : null]);
  if (key === 'amount') return h('input', { class: 'aw-input readonly', value: formatMoney(row.amount), readonly: true });
  return h('input', { class: 'aw-input', value: row[key] || '', onInput: (e: Event) => { row[key] = val(e); if (key === 'qty' || key === 'price') row.amount = Number(row.qty || 0) * Number(row.price || 0); } });
}
function totalAmount(rows: AnyRow[]) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}
function totalBar(items: [string, unknown][]) {
  return h('div', { class: 'aw-line-total' }, [h('span', '合计'), ...items.map(([label, value]) => h('span', [label, '：', h('strong', String(value))]))]);
}

const requestSummaryRows = [
  { id: 'prd-7820864', productNo: '7820864', productName: '半成品物料', model: '规格一', unit: 'KG', sourceCount: 2, totalQty: 1000, purchasedQty: 500, waitQty: 500, forceQuote: '部分', delivery: '2024-12-23', state: '部分采购', tone: 'warn' },
  { id: 'prd-8518691', productNo: '8518691', productName: '铝合金型材', model: 'AL-6061', unit: 'KG', sourceCount: 1, totalQty: 500, purchasedQty: 0, waitQty: 500, forceQuote: '是', delivery: '2024-12-23', state: '待询价', tone: 'info' },
  { id: 'prd-6576642', productNo: '6576642', productName: '精密轴承', model: 'BR-6205', unit: '个', sourceCount: 1, totalQty: 500, purchasedQty: 0, waitQty: 500, forceQuote: '否', delivery: '2024-12-23', state: '待采购', tone: 'info' },
  { id: 'prd-6081578', productNo: '6081578', productName: '外箱包装', model: 'PK-500', unit: '个', sourceCount: 1, totalQty: 500, purchasedQty: 250, waitQty: 250, forceQuote: '否', delivery: '2024-12-23', state: '部分采购', tone: 'warn' },
];

const requestSourceRows: Record<string, AnyRow[]> = {
  'prd-7820864': [
    { id: 'src-7820864-1', code: 'PR-2026-00232', source: '项目请购', object: '项目一', line: 'PR-2026-00232-01', qty: 500, purchasedQty: 250, waitQty: 250, forceQuote: '否', skipReason: '已有有效报价', delivery: '2024-12-23', state: '已转采购' },
    { id: 'src-7820864-2', code: 'PR-2026-00231', source: '生产缺料', object: 'WO-260607-015', line: 'PR-2026-00231-02', qty: 500, purchasedQty: 250, waitQty: 250, forceQuote: '是', skipReason: '-', delivery: '2024-12-23', state: '审批中' },
  ],
  'prd-8518691': [
    { id: 'src-8518691-1', code: 'PR-2026-00232', source: '项目请购', object: '项目一', line: 'PR-2026-00232-03', qty: 500, purchasedQty: 0, waitQty: 500, forceQuote: '是', skipReason: '-', delivery: '2024-12-23', state: '待询价' },
  ],
  'prd-6576642': [
    { id: 'src-6576642-1', code: 'PR-2026-00232', source: '项目请购', object: '项目一', line: 'PR-2026-00232-04', qty: 500, purchasedQty: 0, waitQty: 500, forceQuote: '否', skipReason: '低金额快速采购', delivery: '2024-12-23', state: '已批准' },
  ],
  'prd-6081578': [
    { id: 'src-6081578-1', code: 'PR-2026-00232', source: '库存补货', object: '包装材料月度请购', line: 'PR-2026-00232-05', qty: 500, purchasedQty: 250, waitQty: 250, forceQuote: '否', skipReason: '长期协议价', delivery: '2024-12-23', state: '已转采购' },
  ],
};

const PurchaseModuleDetailEntry = defineComponent({
  props: {
    moduleKey: { type: String as () => PurchaseModule, required: true },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const search = ref('');
    const state = ref('全部');
    const selectedProductId = ref('');
    const message = ref('');
    const statusOptions = ['全部', '部分采购', '待询价', '待采购'];
    const visibleRows = computed(() => {
      const term = search.value.trim();
      return requestSummaryRows.filter((row) => {
        const matchKeyword = !term || [row.productNo, row.productName, row.model, row.state].some((text) => String(text).includes(term));
        const matchState = state.value === '全部' || row.state === state.value;
        return matchKeyword && matchState;
      });
    });
    const selectedProduct = computed(() => {
      const productId = selectedProductId.value || (typeof route.query.product === 'string' ? route.query.product : '');
      return requestSummaryRows.find((row) => row.id === productId) || null;
    });
    const selectedSources = computed(() => selectedProduct.value ? requestSourceRows[selectedProduct.value.id] || [] : []);
    const summaryColumns: AwTableColumn[] = [
      { key: 'productNo', title: '产品编号', width: 130, numeric: true },
      { key: 'productName', title: '产品名称', width: 150 },
      { key: 'model', title: '规格型号', width: 130 },
      { key: 'unit', title: '标准单位', width: 90 },
      { key: 'sourceCount', title: '来源数量', width: 110, numeric: true },
      { key: 'totalQty', title: '请购总量', width: 110, numeric: true },
      { key: 'delivery', title: '交货日期', width: 120 },
      { key: 'state', title: '状态', width: 120, filterOptions: ['待询价', '待采购', '部分采购', '已完成'] },
      { key: 'action', title: '操作', width: 90 },
    ];
    const sourceColumns: AwTableColumn[] = [
      { key: 'code', title: '请购单号', width: 150, link: true },
      { key: 'source', title: '请购来源', width: 120 },
      { key: 'object', title: '来源对象', width: 160 },
      { key: 'line', title: '来源明细', width: 150 },
      { key: 'qty', title: '请购数量', width: 100, numeric: true },
      { key: 'purchasedQty', title: '已采购数量', width: 110, numeric: true },
      { key: 'waitQty', title: '待采购数量', width: 110, numeric: true },
      { key: 'forceQuote', title: '必须询价', width: 90 },
      { key: 'skipReason', title: '免询价/价格依据', width: 150 },
      { key: 'delivery', title: '交货日期', width: 120 },
      { key: 'state', title: '流程状态', width: 110 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ];

    function resetSummary() {
      search.value = '';
      state.value = '全部';
      message.value = '';
    }

    function openSummaryDetail(record: AnyRow, event?: Event) {
      event?.preventDefault();
      event?.stopPropagation();
      selectedProductId.value = String(record.id);
      message.value = '';
      router.push({ path: route.path, query: { action: '请购明细', product: String(record.id) } });
    }

    function closeSummaryDetail() {
      selectedProductId.value = '';
      message.value = '';
      router.push({ path: route.path, query: { action: '请购明细' } });
    }

    function summaryListPage() {
      return h('div', { class: 'pr-summary-page' }, [
        h('section', { class: 'aw-detail-toolbar pr-summary-toolbar' }, [
          h('div', { class: 'pr-list-title' }, [
            h('span', { class: 'pr-title-mark' }),
            h('strong', '请购管理'),
          ]),
          h('button', { class: 'aw-back-btn', onClick: () => emit('back') }, '返回列表'),
        ]),
        h(AwListPage, null, {
          default: () => [
            h(AwListToolbar, {
              searchPlaceholder: '全局搜索（如产品名称、产品编号、请购来源）',
              actions: ['refresh', 'filter', 'columns', 'export', 'import'],
              onSearch: (value: string) => search.value = value,
              onRefresh: resetSummary,
              onFilter: noop,
              onColumns: noop,
              onExport: () => message.value = '请购明细导出已通过 mock 接口提交。',
              onImport: () => message.value = '请购明细导入已通过 mock 接口提交。',
            }),
            h(AwDataTable, {
              columns: summaryColumns,
              rows: visibleRows.value.map((row) => ({ ...row, action: '查看' })),
              rowKey: 'id',
              total: visibleRows.value.length,
              bulkActions: [{ key: 'batch', label: '批量操作' }],
              filterValues: state.value === '全部' ? {} : { state: state.value },
              onColumnFilter: (key: string, value: string) => {
                if (key === 'state') state.value = value || '全部';
              },
            }, {
              cell: ({ column, record, value }: { column: AwTableColumn; record: AnyRow; value: unknown }) => {
                if (column.key === 'state') return h('span', { class: ['aw-status', String(record.tone || '')] }, String(value || '-'));
                if (column.key === 'action') return h('a', { href: `${route.path}?action=${encodeURIComponent('请购明细')}&product=${encodeURIComponent(String(record.id))}`, class: 'aw-text-action' }, '查看');
                return String(value ?? '-');
              },
            }),
            message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
          ],
        }),
      ]);
    }

    function requestSourceTable() {
      if (!selectedProduct.value) return null;
      const product = selectedProduct.value;
      return h(AwFormPage, {
        backText: '返回列表',
        actions: [
          { key: 'cancel', label: '取消' },
          { key: 'draft', label: '暂存' },
          { key: 'export', label: '导出来源', primary: true },
        ],
        onBack: closeSummaryDetail,
        onAction: (key: string) => {
          if (key === 'cancel') {
            closeSummaryDetail();
            return;
          }
          if (key === 'draft') {
            message.value = '请购来源明细已通过 mock 接口暂存。';
            return;
          }
          message.value = '请购来源导出已通过 mock 接口提交。';
        },
      }, {
        default: () => [
          h('section', { class: 'aw-card pr-source-card' }, [
            h('div', { class: 'section-title' }, `${product.productName} 请购数量与来源列表`),
            h(AwDetailInfoGrid, { items: [
              { label: '产品编号', value: product.productNo },
              { label: '产品名称', value: product.productName },
              { label: '规格型号', value: product.model },
              { label: '标准单位', value: product.unit },
              { label: '来源数量', value: String(product.sourceCount) },
              { label: '请购总量', value: String(product.totalQty) },
              { label: '已采购数量', value: String(product.purchasedQty) },
              { label: '待采购数量', value: String(product.waitQty) },
              { label: '必须询价', value: product.forceQuote },
              { label: '交货日期', value: product.delivery },
              { label: '请购状态', value: product.state },
            ] }),
            h('div', { class: 'pr-source-table-actions', style: { width: '100%', display: 'flex', justifyContent: 'flex-end' } }, [
              h('button', { class: 'aw-btn primary', onClick: () => message.value = '一键采购已通过 mock 接口提交。' }, '一键采购'),
            ]),
            h(AwDataTable, {
              columns: sourceColumns,
              rows: selectedSources.value.map((row) => ({ ...row, action: '采购' })),
              rowKey: 'id',
              total: selectedSources.value.length,
              bulkActions: [{ key: 'purchase', label: '批量采购' }],
            }, {
              cell: ({ column, record, value }: { column: AwTableColumn; record: AnyRow; value: unknown }) => {
                if (column.key === 'code') return h('span', { class: 'aw-link' }, String(value || '-'));
                if (column.key === 'state') return h('span', { class: ['aw-status', String(record.state).includes('审批') ? 'info' : String(record.state).includes('转') || String(record.state).includes('批准') ? 'success' : 'warn'] }, String(value || '-'));
                if (column.key === 'action') return h('span', { class: 'aw-link', onClick: () => message.value = `${record.line} 采购已通过 mock 接口提交。` }, '采购');
                return String(value ?? '-');
              },
            }),
            message.value ? h('div', { class: 'aw-form-note' }, message.value) : null,
          ]),
        ],
      });
    }

    return () => props.moduleKey === 'requests'
      ? (selectedProduct.value ? requestSourceTable() : summaryListPage())
      : h('div');
  },
});

const PurchaseDetailView = defineComponent({
  props: {
    moduleKey: { type: String as () => PurchaseModule, required: true },
    id: { type: String, required: true },
  },
  emits: ['back'],
  setup(props, { emit }) {
    const row = ref<PurchaseRow>({ id: '' });
    const activeTab = ref('info');
    const actionMessage = ref('');
    const editMode = ref(false);
    const editRemark = ref('');
    const detailActions: DetailAction[] = [
      { key: 'edit', label: '修改' },
      { key: 'approve', label: '审批' },
      { key: 'print', label: '打印' },
      { key: 'export', label: '导出' },
    ];
    const tabs = computed<DetailTabItem[]>(() => detailSchema(props.moduleKey).tabs);
    const schema = computed(() => detailSchema(props.moduleKey));
    const headerMetas = computed(() => schema.value.header(row.value));
    const detailFields = computed(() => schema.value.fields(row.value));

    watch(() => [props.moduleKey, props.id], load, { immediate: true });

    async function load() {
      row.value = await getPurchaseDetail(props.moduleKey, props.id);
      editRemark.value = String(row.value.remark || '');
      activeTab.value = 'info';
      editMode.value = false;
      actionMessage.value = '';
    }

    async function handleAction(key: string) {
      if (key === 'edit') {
        editMode.value = !editMode.value;
        activeTab.value = 'info';
        actionMessage.value = editMode.value ? '已进入编辑态，可修改备注后保存。' : '已退出编辑态。';
        return;
      }
      if (key === 'approve') {
        await approvePurchase(props.moduleKey, props.id);
        actionMessage.value = '审批动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'print') {
        await printPurchase(props.moduleKey, props.id);
        actionMessage.value = '打印动作已通过 mock 接口提交。';
        return;
      }
      if (key === 'export') {
        await exportPurchase(props.moduleKey, props.id);
        actionMessage.value = '导出动作已通过 mock 接口提交。';
      }
    }

    async function saveEdit() {
      row.value = { ...row.value, remark: editRemark.value };
      await updatePurchase(props.moduleKey, props.id, row.value);
      editMode.value = false;
      actionMessage.value = '详情修改已通过 mock 接口保存。';
    }

    return () => h(AwDetailPage, null, {
      toolbar: () => h(AwDetailToolbar, { actions: detailActions, onBack: () => emit('back'), onAction: handleAction }),
      header: () => h(AwDetailHeader, {
        title: schema.value.title(row.value),
        statusText: String(row.value.state || '-'),
        statusTone: String(row.value.tone || ''),
        code: schema.value.code(row.value),
        metas: headerMetas.value,
      }),
      default: () => h('section', { class: 'aw-card' }, [
        h(AwDetailTabs, { modelValue: activeTab.value, 'onUpdate:modelValue': (value: string) => activeTab.value = value, tabs: tabs.value }),
        activeTab.value === 'info' ? detailInfoBlock(detailFields.value, editMode.value, editRemark.value, (value) => editRemark.value = value, saveEdit) : detailTabBlock(props.moduleKey, activeTab.value, row.value),
        actionMessage.value ? h('div', { class: 'aw-form-note' }, actionMessage.value) : null,
      ]),
    });
  },
});

function detailSchema(module: PurchaseModule) {
  const commonActions = [{ key: 'info', label: '基础信息' }];
  if (module === 'suppliers') {
    return {
      tabs: [
        { key: 'info', label: '供应商信息' },
        { key: 'products', label: '供应产品' },
        { key: 'contacts', label: '联系人信息' },
        { key: 'finance', label: '财务信息' },
        { key: 'address', label: '地址信息' },
        { key: 'quotes', label: '报价记录' },
        { key: 'purchase', label: '采购记录' },
        { key: 'log', label: '操作记录' },
      ],
      title: (r: PurchaseRow) => String(r.name || '供应商详情'),
      code: (r: PurchaseRow) => String(r.code || ''),
      header: (r: PurchaseRow) => [
        { label: '供应商分类', value: String(r.type || '-') },
        { label: '主联系人', value: String(r.contact || '-') },
        { label: '联系方式', value: String(r.phone || '-') },
        { label: '采购人员', value: '老夏' },
      ],
      fields: (r: PurchaseRow) => [
        { label: '供应商编号', value: String(r.code || '-') },
        { label: '供应商名称', value: String(r.name || '-') },
        { label: '供应商分类', value: String(r.type || '-') },
        { label: '细分类', value: String(r.category || '-') },
        { label: '供应商类型', value: String(r.type) === '临时供应商' ? '临时供应商' : '正式供应商' },
        { label: '来源单据', value: String(r.source || '-') },
        { label: '信用代码', value: '91440300MA5DXXXXX' },
        { label: '采购人员', value: '老夏' },
        { label: '付款账期', value: '月结30天' },
        { label: '创建日期', value: String(r.date || '-') },
        { label: '供应商状态', value: String(r.state || '-') },
      ],
    };
  }
  if (module === 'requests') {
    return {
      tabs: [{ key: 'info', label: '请购信息' }, { key: 'lines', label: '请购明细' }, { key: 'attachments', label: '附件/备注' }, { key: 'log', label: '操作记录' }],
      title: (r: PurchaseRow) => String(r.topic || '请购详情'),
      code: (r: PurchaseRow) => String(r.code || ''),
      header: (r: PurchaseRow) => [
        { label: '申请日期', value: String(r.date || '-') },
        { label: '请购人', value: String(r.starter || '-') },
        { label: '请购来源', value: String(r.source || '-') },
        { label: '关联单据', value: String(r.ref || '-') },
        { label: '打印状态', value: String(r.printState || '未打印') },
      ],
      fields: (r: PurchaseRow) => [
        { label: '请购单号', value: String(r.code || '-') },
        { label: '请购主题', value: String(r.topic || '-') },
        { label: '请购日期', value: String(r.date || '-') },
        { label: '请购人', value: String(r.starter || '-') },
        { label: '请购来源', value: String(r.source || '-') },
        { label: '关联单据', value: String(r.ref || '-') },
        { label: '流程状态', value: String(r.state || '-') },
        { label: '打印状态', value: String(r.printState || '未打印') },
      ],
    };
  }
  if (module === 'inquiries') {
    return {
      tabs: [{ key: 'info', label: '询价信息' }, { key: 'lines', label: '询价明细' }, { key: 'attachments', label: '附件/备注' }, { key: 'log', label: '操作记录' }],
      title: (r: PurchaseRow) => String(r.topic || '询价详情'),
      code: (r: PurchaseRow) => String(r.code || ''),
      header: (r: PurchaseRow) => [
        { label: '询价日期', value: String(r.date || '-') },
        { label: '截止日期', value: String(r.deadline || '-') },
        { label: '询价产品', value: String(r.product || '-') },
        { label: '询价数量', value: String(r.qty || '-') },
      ],
      fields: (r: PurchaseRow) => [
        { label: '询价主题', value: String(r.topic || '-') },
        { label: '询价编号', value: String(r.code || '-') },
        { label: '询价日期', value: String(r.date || '-') },
        { label: '截止日期', value: String(r.deadline || '-') },
        { label: '询价产品', value: String(r.product || '-') },
        { label: '询价状态', value: String(r.state || '-') },
      ],
    };
  }
  return {
    tabs: [{ key: 'info', label: '采购信息' }, { key: 'lines', label: '采购明细' }, { key: 'inbound', label: '入库记录' }, { key: 'match', label: '三单匹配' }, { key: 'payable', label: '应付暂估' }, { key: 'quality', label: '质检扣款' }, { key: 'payment', label: '付款记录' }, { key: 'invoice', label: '到票记录' }, { key: 'source', label: '来源记录' }, { key: 'log', label: '操作记录' }],
    title: (r: PurchaseRow) => String(r.code || '采购订单详情'),
    code: (r: PurchaseRow) => String(r.code || ''),
    header: (r: PurchaseRow) => [
      { label: '供应商', value: String(r.supplier || '-') },
      { label: '采购日期', value: String(r.date || '-') },
      { label: '预计到货', value: String(r.arrival || '-') },
      { label: '采购金额', value: String(r.amount || '-') },
    ],
    fields: (r: PurchaseRow) => [
      { label: '采购编号', value: String(r.code || '-') },
      { label: '供应商', value: String(r.supplier || '-') },
      { label: '采购日期', value: String(r.date || '-') },
      { label: '预计到货', value: String(r.arrival || '-') },
      { label: '采购金额', value: String(r.amount || '-') },
      { label: '采购状态', value: String(r.state || '-') },
      { label: '来源单据', value: '询价定价单 IQ-20251219001' },
      { label: '付款条件', value: '月结30天 / 到票后付款' },
      { label: '三单匹配', value: String(r.match || '-') },
      { label: '可付款金额', value: String(r.payable || '-') },
      { label: '暂估应付', value: String(r.provisional || '-') },
      { label: '发票认证', value: String(r.certified || '-') },
    ],
  };
}

function detailInfoBlock(fields: { label: string; value: string }[], editMode: boolean, remark: string, updateRemark: (value: string) => void, saveEdit: () => void) {
  return [
    h('div', { class: 'aw-detail-section-title' }, '基础信息'),
    h(AwDetailInfoGrid, { items: fields }),
    h('div', { class: 'aw-detail-section-title' }, '备注'),
    editMode
      ? h('div', { class: 'aw-detail-edit' }, [
          h('textarea', { class: 'aw-input reason-area', value: remark, placeholder: '请输入详情备注', onInput: (event: Event) => updateRemark(val(event)) }),
          h('button', { class: 'aw-btn primary', onClick: saveEdit }, '保存修改'),
        ])
      : h('div', { class: 'aw-remark-box' }, remark || '请供应商/采购相关人员按单据要求推进后续业务。'),
  ];
}

function detailTabBlock(module: PurchaseModule, tab: string, row: PurchaseRow) {
  if (tab === 'attachments') return attachmentsBlock(module);
  if (tab === 'log') return recordBlock('操作记录', ['序号', '操作类型', '操作人', '操作时间', '操作内容'], operationRows(module, row));
  if (module === 'suppliers') return supplierDetailTab(tab, row);
  if (module === 'requests') return requestDetailTab(tab);
  if (module === 'inquiries') return inquiryDetailTab(tab);
  return orderDetailTab(tab, row);
}

function supplierDetailTab(tab: string, row: PurchaseRow) {
  const tables: Record<string, [string, string[], string[][]]> = {
    products: ['供应产品', ['序号', '物料编码', '物料名称', '规格型号', '物料类别', '品牌', '标准单位', '供货单位', '换算系数', '参考采购价', '交期'], [
      ['1', '7820864', '半成品物料', '规格一', '半成品', '通用', 'KG', 'KG', '1', '50.00', '7天'],
      ['2', '8518691', '铝合金型材', '6061-T6', '原材料', '华南铝材', 'KG', 'KG', '1', '32.00', '5天'],
    ]],
    contacts: ['联系人信息', ['序号', '联系人', '职位', '联系方式', '邮箱', '默认', '备注'], [['1', String(row.contact || '张伟'), '销售经理', String(row.phone || '13800138001'), 'zhangwei@example.com', '是', '主要采购对接人']]],
    finance: ['财务信息', ['序号', '银行卡号', '账户名称', '开户行', '账户类型', '默认'], [['1', '6217000000123456789', String(row.name || '供应商'), '中国工商银行深圳福田支行', '对公账户', '是']]],
    address: ['地址信息', ['序号', '地址类型', '收件人', '联系电话', '详细地址', '默认'], [['1', '办公地址', String(row.contact || '张伟'), String(row.phone || '13800138001'), '广东省深圳市福田区华强北路1002号赛格广场32楼', '是']]],
    quotes: ['报价记录', ['序号', '询价单号', '物料名称', '报价单价', '是否含税', '交货期', '报价状态'], [['1', 'XJ-202512-003', '半成品物料', '50.00', '是', '7天', '已定价']]],
    purchase: ['采购记录', ['序号', '采购单号', '采购金额', '已付金额', '到票金额', '采购状态'], [['1', 'CG-20251221001', '5959.00', '5959.00', '5959.00', '审核中']]],
  };
  const config = tables[tab] || tables.products;
  return recordBlock(config[0], config[1], config[2]);
}

function requestDetailTab(tab: string) {
  if (tab === 'lines') {
    return recordBlock('请购明细', ['序号', '来源明细', '物料编码', '物料名称', '规格型号', '单位', '请购数量', '期望交付日期', '用途', '操作'], [
      ['1', 'PR-2026-00232-01', '7820864', '半成品物料', '规格一', 'KG', '500', '2024-12-23', '用于生产', '采购'],
      ['2', 'PR-2026-00232-02', '5786931', '半成品物料', '规格一', 'KG', '500', '2024-12-23', '用于生产', '采购'],
      ['3', 'PR-2026-00232-03', '8518691', '铝合金型材', 'AL-6061', 'KG', '500', '2024-12-23', '用于生产', '采购'],
    ], [['请购总数量', '1500']]);
  }
  return attachmentsBlock('requests');
}

function inquiryDetailTab(tab: string) {
  if (tab === 'lines') {
    return recordBlock('询价明细', ['序号', '产品编号', '产品名称', '产品型号', '分类', '标准单位', '数量', '来源明细', '供应商', '供应商类型', '报价版本', '单价', '是否含税', '折扣', '金额', '税额', '交货期', '最小采购量', '采购生成', '操作'], [
      ['1', '7820864', '半成品物料', 'HM-450', '半成品', 'KG', '8', '1 / 供应商档案', '深圳鑫达电子科技有限公司', '正式', 'V1', '50.00', '是', '98%', '392.00', '50.96', '2025-12-20', '20', '待生成采购', '定价'],
      ['2', '5786931', '铝合金型材', 'AL-20', '型材', '米', '12', '1 / 临时供应商', '佛山启明金属材料有限公司', '临时', 'V1', '86.00', '否', '95%', '980.40', '0.00', '2025-12-18', '10', '待转正供应商', '已定价'],
    ]);
  }
  return attachmentsBlock('inquiries');
}

function orderDetailTab(tab: string, row: PurchaseRow) {
  const map: Record<string, [string, string[], string[][]]> = {
    lines: ['采购明细', ['序号', '来源明细', '产品编号', '产品名称', '规格型号', '单位', '采购数量', '已入库', '待入库', '单价', '应付金额', '预计到货', '状态'], [['1', 'IQ-20251219001-01', '7820864', '半成品物料', 'HM-450', 'KG', '50', '25', '25', '59.60', String(row.payable || '2980.00'), String(row.arrival || '2025-12-31'), '部分入库']]],
    inbound: ['入库记录', ['序号', '来源明细', '入库单号', '入库类型', '入库仓库/库位', '入库数量', 'IQC状态', '合格/让步/拒收', '入库人', '入库时间'], [['1', 'IQ-20251219001-01', 'RK-20251221001', '采购入库', '原料仓/A-01-01', '250', '已放行', '240 / 10 / 0', '陈仓', '2025-12-22 10:30']]],
    match: ['三单匹配', ['序号', '来源明细', '采购单', '入库单', '发票号', '订单金额', '入库金额', '到票金额', '差异类型', '差异金额', '匹配状态'], [['1', 'IQ-20251219001-01', String(row.code || ''), 'RK-20251221001', 'INV-20251224088', '5960.00', '5960.00', '5960.00', '无', '0.00', String(row.match || '已匹配')]]],
    payable: ['暂估应付', ['序号', '来源明细', '暂估单号', '来源入库', '暂估金额', '质检扣款', '已冲回', '可付款金额', '账期到期日', '状态'], [['1', 'PR-2026-00232-02', 'AP-EST-20251223001', 'RK-20251223003', String(row.provisional || '3800.00'), '200.00', '0.00', String(row.payable || '3600.00'), '2026-01-23', '有效']]],
    quality: ['质检扣款', ['序号', '来源明细', '质检单号', '问题类型', '不合格数量', '让步数量', '拒收数量', '扣款金额', '关联入库', '处理状态'], [['1', 'PR-2026-00232-02', 'QC-20251223009', '外观划伤', '20', '0', '20', String(row.deduction || '200.00'), 'RK-20251223003', '供应商确认中']]],
    payment: ['付款记录', ['序号', '来源明细', '付款申请号', '申请金额', '可付款金额', '本次付款', '付款账户', '付款条件', '付款状态', '经办人', '付款日期'], [['1', 'PR-2026-00232-02', 'PAY-20251224001', String(row.amount || '5960.00'), String(row.payable || '3600.00'), String(row.paid || '3000.00'), '招商银行基本户', '到票后付款', '待财务审核', '王会计', '2025-12-24']]],
    invoice: ['到票记录', ['序号', '来源明细', '发票号码', '发票类型', '含税金额', '税额', '认证状态', '认证日期', '收票人', '收票日期'], [['1', 'IQ-20251219001-01', 'INV-20251224088', '增值税专票', String(row.invoice || '5960.00'), '684.96', String(row.certified || '待认证'), '-', '王会计', '2025-12-24']]],
    source: ['来源记录', ['序号', '来源类型', '来源单号', '来源明细', '来源主题', '转单数量', '已采购回写', '转单人', '转单时间'], [['1', '询价定价', 'IQ-20251219001', 'IQ-20251219001-01', '12月物料询价定价', '3项', '已回写已采购数量', '采购员李文涛', '2025-12-21 09:10']]],
  };
  const config = map[tab] || map.lines;
  return recordBlock(config[0], config[1], config[2]);
}

function attachmentsBlock(module: PurchaseModule | string) {
  const remark = module === 'requests'
    ? '用于生产线急需物料补充，请优先安排采购询价。'
    : '请供应商在截止日期前反馈含税价、交期和最小采购量。';
  return [
    h('div', { class: 'aw-detail-section-title' }, '备注'),
    h('div', { class: 'aw-remark-box' }, remark),
    h('div', { class: 'aw-detail-section-title' }, '附件'),
    h('div', { class: 'aw-attach-grid' }, [1, 2, 3].map(() => h('div', { class: 'aw-attach-card' }, [
      h('strong', '新建文本文档.PDF'),
      h('span', '文件大小：0 Bytes'),
      h('span', '上传日期：2024-08-1 17:45:27'),
      h('div', [h('span', { class: 'aw-link' }, '查看'), h('span', { class: 'aw-link attach-gap' }, '下载')]),
    ]))),
  ];
}

function operationRows(module: PurchaseModule, row: PurchaseRow) {
  const owner = module === 'suppliers' ? '老夏' : module === 'orders' ? '采购员李文涛' : String(row.starter || '李文涛');
  return [
    ['1', '创建', owner, `${String(row.date || '2025-12-21')} 09:12`, `创建${detailSchema(module).title(row)}`],
    ['2', '审核', '采购主管', `${String(row.date || '2025-12-21')} 11:05`, '审核通过，等待后续业务推进'],
  ];
}

function recordBlock(title: string, columns: string[], rows: string[][], totals: [string, string][] = []) {
  return [
    h('div', { class: 'aw-detail-section-title' }, title),
    h('div', { class: 'aw-doc-tbl-wrap' }, [
      h('div', { class: 'aw-doc-tbl-inner' }, [
        h('table', { class: 'aw-doc-tbl' }, [
          h('thead', [h('tr', columns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
          h('tbody', rows.length ? rows.map((cells) => h('tr', cells.map((cell) => h('td', cell)))) : [h('tr', [h('td', { colspan: columns.length, class: 'aw-empty-cell' }, '暂无记录')])]),
        ]),
      ]),
    ]),
    totals.length ? totalBar(totals) : null,
  ];
}
</script>

<style scoped>
.aw-purchase-modal {
  width: min(980px, 94vw);
  max-height: 86vh;
}
.aw-purchase-modal.small {
  width: min(720px, 92vw);
}
.aw-modal-close {
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--aw-fg-4);
  font-size: 18px;
}
.aw-source-picker {
  display: grid;
  grid-template-columns: 180px 1fr;
  padding: 0;
}
.aw-source-picker aside {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 8px;
  border-right: 1px solid var(--aw-border);
  background: var(--aw-surface-2);
}
.aw-source-picker aside button {
  border: 0;
  background: transparent;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}
.aw-source-picker aside button.on,
tr.picked {
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
}
.aw-picker-count {
  padding: 0 0 10px;
  color: var(--aw-primary);
  font-size: 13px;
  font-weight: 500;
}
.aw-line-total {
  display: flex;
  gap: 28px;
  padding: 12px;
  white-space: nowrap;
}
.aw-line-total strong {
  color: var(--aw-danger);
}
.aw-empty {
  padding: 24px 12px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  color: var(--aw-fg-3);
  text-align: center;
}
.aw-upload-card {
  min-height: 118px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  color: var(--aw-fg-3);
}
.readonly {
  background: #f5f6fa;
}
.danger {
  color: var(--aw-danger);
}
.mini {
  padding-inline: 8px;
}
.reason-area {
  height: 86px;
  resize: vertical;
  padding: 8px 10px;
}
.aw-warning-line {
  margin-top: 4px;
  color: var(--aw-warning);
  font-size: 11px;
}
.inquiry-table th,
.inquiry-table td {
  min-width: 90px;
}
.inquiry-table tr.summary {
  background: var(--aw-surface-2);
}
.pr-detail-page {
  padding: 20px;
  background: var(--aw-bg);
  min-height: 100%;
}
.pr-summary-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}
.pr-summary-toolbar .aw-back-btn {
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  padding: 0 12px;
  background: #fff;
}
.aw-text-action {
  border: 0;
  background: transparent;
  color: var(--aw-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
  padding: 0;
}
.pr-detail-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  color: var(--aw-fg);
}
.pr-detail-title .aw-btn {
  margin-left: auto;
}
.pr-title-mark {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: var(--aw-primary);
}
.pr-detail-toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 520px) 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: var(--aw-surface);
}
.pr-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.pr-detail-table {
  margin-top: 12px;
}
.pr-detail-table select,
.pr-detail-footer select {
  height: 28px;
  border: 1px solid var(--aw-border);
  border-radius: 4px;
  background: #fff;
}
.pr-detail-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  background: var(--aw-surface);
}
.pr-detail-footer .grow {
  flex: 1;
}
.aw-page.current {
  min-width: 28px;
  height: 28px;
  border: 0;
  border-radius: 4px;
  background: var(--aw-primary);
  color: #fff;
}
.pr-source-card {
  margin-top: 16px;
}
.pr-source-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
.pr-source-head p {
  margin: 4px 0 0;
  color: var(--aw-fg-3);
  font-size: 12px;
}
.pr-source-table-actions {
  display: flex;
  justify-content: flex-end;
  margin: 14px 0 8px;
  padding-right: 22px;
}
@media (max-width: 760px) {
  .pr-detail-toolbar {
    grid-template-columns: 1fr;
  }
  .pr-detail-actions {
    justify-content: flex-start;
  }
}
</style>
