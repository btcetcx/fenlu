<template>
  <aw-detail-page v-if="service">
    <template #toolbar>
      <aw-detail-toolbar
        back-text="返回售后列表"
        :actions="detailActions"
        @back="emit('back')"
        @action="handleAction"
      />
    </template>

    <template #header>
      <aw-detail-header
        :title="service.topic"
        :code="service.code"
        :status-text="service.statusName"
        :status-tone="statusTone(service.status)"
        :metas="headerMetas"
      >
        <div class="as-summary-line">
          <span>处理方式：{{ service.handlingMethod }}</span>
          <span>仓储：{{ service.warehouseStatus }}</span>
          <span>财务：{{ service.financeStatus }}</span>
          <span>发票：{{ service.invoiceStatus }}</span>
          <span>质量：{{ service.qualityStatus }}</span>
        </div>
      </aw-detail-header>
    </template>

    <aw-detail-metric-grid :items="summaryMetrics" />
    <aw-detail-tabs v-model="activeTab" :tabs="tabs" />

    <section v-if="activeTab === 'basic'" class="aw-form-card">
      <div class="aw-detail-section-title">基本信息</div>
      <aw-detail-info-grid :items="basicItems" />
    </section>

    <section v-else-if="activeTab === 'lines'" class="aw-form-card">
      <div class="aw-detail-section-title">售后产品明细</div>
      <aw-editable-sub-table :columns="lineColumns" :rows="service.lines" add-text="添加明细" :show-add="false">
        <template #cell="{ column, row }">
          <span>{{ formatLineCell(row[column.key], column.key) }}</span>
        </template>
      </aw-editable-sub-table>
    </section>

    <section v-else-if="activeTab === 'docs'" class="aw-form-card">
      <div class="aw-detail-section-title">关联单据与状态回填</div>
      <div class="as-writeback-summary">
        <span :class="['aw-status', statusTone(service.status)]">{{ service.statusName }}</span>
        <strong>{{ writebackSummary }}</strong>
      </div>
      <aw-editable-sub-table :columns="docColumns" :rows="documentRows" add-text="添加单据" :show-add="false" :action-width="120">
        <template #cell="{ column, row }">
          <span v-if="column.key === 'status'" :class="['aw-status', docTone(String(row.status))]">{{ row.status }}</span>
          <span v-else>{{ row[column.key] || '-' }}</span>
        </template>
        <template #actions="{ row }">
          <span v-if="row.generated && !isTerminalDoc(row.status)" class="aw-link" @click="advanceDoc(String(row.id))">推进状态</span>
          <span v-else class="aw-muted">{{ row.generated ? '已完成' : '未生成' }}</span>
        </template>
      </aw-editable-sub-table>
    </section>

    <section v-else-if="activeTab === 'sla'" class="aw-form-card">
      <div class="aw-detail-section-title">SLA / 流程进度</div>
      <div class="as-flow">
        <div v-for="step in flowSteps" :key="step.label" :class="['as-flow-step', step.done ? 'done' : '']">
          <i>{{ step.index }}</i>
          <strong>{{ step.label }}</strong>
          <span>{{ step.desc }}</span>
        </div>
      </div>
    </section>

    <section v-else class="aw-form-card">
      <div class="aw-detail-section-title">{{ activeTabLabel }}</div>
      <div class="as-log-list">
        <div v-for="item in activeTextRows" :key="item" class="as-log-row">{{ item }}</div>
        <div v-if="!activeTextRows.length" class="as-log-row muted">暂无记录</div>
      </div>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { AfterSalesLinkedDocument, AfterSalesService, HandlingMethod } from '@/app/api/after-sales/types';
import { advanceAfterSalesLinkedDocument, closeAfterSalesService, escalateAfterSalesQualityAction, getAfterSalesRequiredDocumentTypes, getAfterSalesService, listAfterSalesLinkedDocuments } from '@/app/api/after-sales/resources';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailMetricGrid from '@/components/detail-page/AwDetailMetricGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';

interface DetailDocRow {
  id: string;
  serviceId: string;
  type: string;
  code: string;
  status: string;
  ownerName: string;
  updatedAt: string;
  writebackLogs: string[];
  generated: boolean;
  writebackText: string;
}

const props = defineProps<{ serviceId: string }>();
const emit = defineEmits<{ back: []; changed: [] }>();
const service = ref<AfterSalesService>();
const documents = ref<AfterSalesLinkedDocument[]>([]);
const activeTab = ref('basic');
const requiredDocumentTypes = ['退货入库单', '换货出库单', '配件出库单', '付款单/退款单', '应收调整', '发票红冲', '服务派工单', '质量闭环单'];
const tabs = [
  { key: 'basic', label: '基本信息' },
  { key: 'lines', label: '售后产品明细' },
  { key: 'docs', label: '关联单据' },
  { key: 'sla', label: 'SLA/流程进度' },
  { key: 'communication', label: '沟通记录' },
  { key: 'attachments', label: '附件' },
  { key: 'logs', label: '操作记录' },
];
const detailActions = computed(() => {
  const actions = [];
  if (!hasQualityDocument.value) actions.push({ key: 'quality', label: '升级质量闭环' });
  if (service.value?.status === 'pendingCloseConfirm') actions.push({ key: 'close', label: '结单确认' });
  return actions;
});
const headerMetas = computed(() => service.value ? [
  { label: '客户', value: service.value.customerName },
  { label: 'SLA', value: service.value.sla },
  { label: '负责人', value: service.value.ownerName },
  { label: '创建时间', value: service.value.submittedAt },
] : []);
const summaryMetrics = computed(() => service.value ? [
  { label: '可售后数量', value: service.value.availableQuantity },
  { label: '可退金额', value: money(service.value.refundableAmount) },
  { label: '结单确认', value: service.value.closeConfirmStatus },
  { label: '关联单据', value: `${documents.value.length} 张` },
] : []);
const basicItems = computed(() => service.value ? [
  { label: '售后类型', value: service.value.afterSalesType },
  { label: '处理方式', value: service.value.handlingMethod },
  { label: '客户联系人', value: service.value.contactName },
  { label: '收货地址', value: service.value.address },
  { label: '来源订单', value: service.value.sourceOrder },
  { label: '来源发货单', value: service.value.sourceDelivery },
  { label: '来源明细', value: service.value.sourceLine },
  { label: '问题原因', value: service.value.reason },
  { label: '投诉问题', value: service.value.complaint },
  { label: '优先级', value: service.value.priority },
  { label: '质量联动', value: service.value.qualityStatus },
  { label: '问题说明', value: service.value.description },
] : []);
const lineColumns = [
  { key: 'productCode', title: '产品编码', width: 130 },
  { key: 'productName', title: '产品名称', width: 180 },
  { key: 'spec', title: '规格', width: 120 },
  { key: 'sourceLine', title: '来源明细', width: 170 },
  { key: 'quantity', title: '本次售后数量', width: 130 },
  { key: 'availableQuantity', title: '可售后数量', width: 110 },
  { key: 'refundableAmount', title: '可退金额', width: 120 },
  { key: 'reason', title: '问题原因', width: 120 },
  { key: 'complaint', title: '投诉问题', width: 120 },
];
const docColumns = [
  { key: 'type', title: '单据类型', width: 130 },
  { key: 'code', title: '单据编号', width: 170 },
  { key: 'status', title: '状态', width: 120 },
  { key: 'ownerName', title: '负责人', width: 120 },
  { key: 'updatedAt', title: '更新时间', width: 160 },
  { key: 'writebackText', title: '回写记录', width: 280 },
];
const documentRows = computed<DetailDocRow[]>(() => requiredDocumentTypes.map((type) => {
  const matched = documents.value.find((item) => item.type === type || (type === '付款单/退款单' && item.type === '退款付款单'));
  if (matched) return { ...matched, generated: true, writebackText: matched.writebackLogs[0] || '等待回写' };
  return {
    id: `placeholder_${type}`,
    serviceId: service.value?.id || '',
    type,
    code: '未生成',
    status: '无需处理',
    ownerName: '-',
    updatedAt: '-',
    writebackLogs: [],
    generated: false,
    writebackText: '当前处理方式未生成该单据',
  };
}));
const hasQualityDocument = computed(() => documents.value.some((doc) => doc.type === '质量闭环单'));
const activeTabLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || '');
const writebackSummary = computed(() => {
  if (!service.value) return '';
  if (service.value.status === 'pendingCloseConfirm') return '派生单据已满足当前处理方式的回填规则，可进行内部结单确认。';
  if (service.value.status === 'closedQualityTracking') return '售后已结单，质量闭环继续追踪。';
  if (service.value.status === 'closed') return '售后已结单，所有业务处理完成。';
  return '派生单据仍在处理中，完成后将自动回填售后单状态。';
});
const flowSteps = computed(() => {
  const status = service.value?.status;
  const requiredDone = requiredDocsDone();
  return [
    { index: 1, label: '售后提交', desc: service.value?.submittedAt || '-', done: true },
    { index: 2, label: '派生单据生成', desc: `${documents.value.length} 张关联单据`, done: documents.value.length > 0 },
    { index: 3, label: '执行处理中', desc: writebackSummary.value, done: requiredDone || ['pendingCloseConfirm', 'closed', 'closedQualityTracking'].includes(String(status)) },
    { index: 4, label: '结单确认', desc: service.value?.closeConfirmStatus || '-', done: ['pendingCloseConfirm', 'closed', 'closedQualityTracking'].includes(String(status)) },
    { index: 5, label: '质量追踪', desc: service.value?.qualityStatus || '-', done: service.value?.qualityStatus === '无需闭环' || service.value?.qualityStatus === '已关闭' },
  ];
});
const activeTextRows = computed(() => {
  if (!service.value) return [];
  if (activeTab.value === 'communication') return service.value.communicationLogs;
  if (activeTab.value === 'attachments') return service.value.attachments;
  if (activeTab.value === 'logs') return service.value.operationLogs;
  return [];
});

async function loadData() {
  service.value = await getAfterSalesService(props.serviceId);
  documents.value = await listAfterSalesLinkedDocuments(props.serviceId);
}

async function advanceDoc(id: string) {
  if (id.startsWith('placeholder_')) return;
  await advanceAfterSalesLinkedDocument(id);
  await loadData();
  emit('changed');
}

async function handleAction(key: string) {
  if (!service.value) return;
  if (key === 'quality') {
    await escalateAfterSalesQualityAction(service.value.id);
    await loadData();
    emit('changed');
    return;
  }
  if (key !== 'close' || service.value.status !== 'pendingCloseConfirm') return;
  await closeAfterSalesService(service.value.id);
  await loadData();
  emit('changed');
}

function statusTone(status: string) {
  if (['closed', 'closedQualityTracking'].includes(status)) return 'green';
  if (status === 'pendingCloseConfirm') return 'yellow';
  if (status === 'escalated') return 'red';
  return 'blue';
}

function docTone(status: string) {
  if (isTerminalDoc(status)) return 'green';
  if (status === '无需处理') return 'gray';
  if (status.startsWith('待')) return 'yellow';
  return 'blue';
}

function isTerminalDoc(status: unknown) {
  return ['已质检', '已签收', '已付款', '已完成', '已关闭', '已调整', '已红冲'].includes(String(status));
}

function requiredDocsDone() {
  if (!service.value) return false;
  const required = getAfterSalesRequiredDocumentTypes(service.value.handlingMethod as HandlingMethod);
  return required.length > 0 && required.every((type) => {
    const doc = documents.value.find((item) => item.type === type);
    return doc && isTerminalDoc(doc.status);
  });
}

function formatLineCell(value: unknown, key: string) {
  if (key === 'refundableAmount' && typeof value === 'number') return money(value);
  return value ?? '-';
}

function money(value: number) {
  return value.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 });
}

watch(() => props.serviceId, loadData);
onMounted(loadData);
</script>

<style scoped>
.as-summary-line {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  color: var(--aw-muted);
}

.as-writeback-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.as-flow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.as-flow-step {
  min-height: 116px;
  border: 1px solid var(--aw-border);
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.as-flow-step i {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f2f4f7;
  color: var(--aw-muted);
  font-style: normal;
}

.as-flow-step.done i {
  background: #eaf8f1;
  color: #0f9f6e;
}

.as-flow-step strong,
.as-flow-step span {
  display: block;
  margin-top: 8px;
}

.as-flow-step span {
  color: var(--aw-muted);
  font-size: 12px;
}

.as-log-list {
  display: grid;
  gap: 8px;
}

.as-log-row {
  padding: 10px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
}

.as-log-row.muted {
  color: var(--aw-muted);
}
</style>
