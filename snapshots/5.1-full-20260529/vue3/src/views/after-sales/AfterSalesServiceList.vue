<template>
  <after-sales-service-create v-if="currentView === 'new'" @back="goList" @created="openService" />
  <after-sales-service-detail v-else-if="currentView === 'detail' && activeService" :service-id="activeService.id" @back="goList" @changed="loadData" />
  <section v-else-if="currentView === 'detail'" class="aw-form-card as-missing-detail">
    <div class="aw-detail-section-title">售后单不存在</div>
    <p>未找到当前售后单，可能已被删除或不在当前数据范围内。</p>
    <button class="aw-btn primary" type="button" @click="goList">返回售后列表</button>
  </section>
  <after-sales-setting-page v-else-if="currentView === 'setting'" :initial-key="activeSettingKey" :single-page="settingFromAction" back-path="/after-sales/services" />
  <aw-list-page v-else>
    <aw-list-toolbar
      search-placeholder="搜索售后主题/单号/客户/来源单据"
      create-label="新增售后"
      @search="handleSearch"
      @refresh="loadData"
      @filter="handleToolbarAction('filter')"
      @columns="handleToolbarAction('columns')"
      @import="handleToolbarAction('import')"
      @export="handleToolbarAction('export')"
      @create="handleCreate"
    />

    <div v-if="listMessage" class="as-list-message">{{ listMessage }}</div>

    <aw-data-table
      :columns="serviceColumns"
      :rows="tableRows"
      row-key="id"
      :total="filteredItems.length"
      :bulk-actions="serviceBulkActions"
      :filter-values="columnFilters"
      @selection-change="handleSelectionChange"
      @batch-action="handleBatchAction"
      @column-filter="handleColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'topic'" class="aw-link" @click="openService(String(record.id))">{{ value }}</span>
        <span v-else-if="column.key === 'statusName'" :class="['aw-status', statusTone(String(record.status))]">{{ value }}</span>
        <span v-else-if="column.key === 'priority'" :class="['aw-status', priorityTone(String(value))]">{{ value }}</span>
        <span v-else-if="column.key === 'action'">
          <span class="aw-link" @click="openService(String(record.id))">查看</span>
          <span class="aw-action-split">|</span>
          <span class="aw-link" @click="handleAssign(String(record.id))">处理/指派</span>
          <span class="aw-action-split">|</span>
          <span :class="canClose(String(record.status)) ? 'aw-link' : 'aw-muted'" :title="closeHint(record)" @click="handleCloseAttempt(record)">
            {{ closeActionText(record) }}
          </span>
        </span>
        <span v-else>{{ formatCellValue(value, column.numeric) }}</span>
      </template>
    </aw-data-table>

    <div v-if="!filteredItems.length" class="as-empty-state">
      当前筛选条件下暂无售后单，可清空搜索或表头筛选。
    </div>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AfterSalesService } from '@/app/api/after-sales/types';
import { listAfterSalesServices } from '@/app/api/after-sales/resources';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AfterSalesServiceCreate from './AfterSalesServiceCreate.vue';
import AfterSalesServiceDetail from './AfterSalesServiceDetail.vue';
import AfterSalesSettingPage from './AfterSalesSettingPage.vue';
import { serviceBulkActions, serviceColumns } from './afterSalesList.config';

const router = useRouter();
const route = useRoute();
const items = ref<AfterSalesService[]>([]);
const keyword = ref('');
const columnFilters = ref<Record<string, string>>({});
const selectedKeys = ref<string[]>([]);
const listMessage = ref('');
const settingActionKeys = ['售后原因', '投诉问题', '售后类型', '处理方式'];
const activeServiceId = computed(() => String(route.query.id || ''));
const activeSlaFilter = computed(() => String(route.query.sla || ''));
const activeQualityFilter = computed(() => String(route.query.quality || ''));
const activeAction = computed(() => String(route.query.action || ''));
const settingFromAction = computed(() => settingActionKeys.includes(activeAction.value));
const activeSettingKey = computed(() => String(route.query.setting || (settingFromAction.value ? activeAction.value : '') || '售后原因'));
const isCreateAction = computed(() => route.query.action === 'new' || activeAction.value === '新增售后');
const currentView = computed(() => route.query.setting || settingFromAction.value ? 'setting' : isCreateAction.value ? 'new' : activeServiceId.value ? 'detail' : 'list');
const activeService = computed(() => items.value.find((item) => item.id === activeServiceId.value));
const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const statusMatched = !columnFilters.value.statusName || item.statusName === columnFilters.value.statusName;
    const typeMatched = !columnFilters.value.afterSalesType || item.afterSalesType === columnFilters.value.afterSalesType;
    const priorityMatched = !columnFilters.value.priority || item.priority === columnFilters.value.priority;
    const slaMatched = activeSlaFilter.value !== 'overdue' || safeText(item.sla).includes('超时');
    const qualityMatched = activeQualityFilter.value !== 'linked' || item.qualityStatus !== '无需闭环';
    const keywordMatched = !term || [item.topic, item.code, item.customerName, item.sourceOrder, item.sourceDelivery, item.ownerName].some((value) => safeText(value).includes(term));
    return statusMatched && typeMatched && priorityMatched && slaMatched && qualityMatched && keywordMatched;
  });
});
const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, action: '操作' })));

async function loadData() {
  const result = await listAfterSalesServices({ pageNo: 1, pageSize: 100 });
  items.value = result.items;
}

function handleSearch(value: string) {
  keyword.value = value;
}

function handleColumnFilter(columnKey: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [columnKey]: value };
}

function handleSelectionChange(keys: string[]) {
  selectedKeys.value = keys;
}

function handleBatchAction(actionKey: string, keys: string[]) {
  selectedKeys.value = keys;
  const handlers: Record<string, (pickedKeys: string[]) => string> = {
    assign: (pickedKeys) => pickedKeys.length ? `批量指派已选择 ${pickedKeys.length} 条售后单。` : '请先选择要批量指派的售后单。',
    export: (pickedKeys) => pickedKeys.length ? `将导出已选择的 ${pickedKeys.length} 条售后单。` : `将导出当前筛选结果 ${filteredItems.value.length} 条售后单。`,
  };
  listMessage.value = handlers[actionKey]?.(keys) || '当前批量操作暂未配置处理逻辑。';
}

function handleCreate() {
  router.push({ path: '/after-sales/services', query: { action: 'new' } });
}

async function openService(id: string) {
  await loadData();
  router.push({ path: '/after-sales/services', query: { id } });
}

function goList() {
  router.push('/after-sales/services');
  loadData();
}

function handleToolbarAction(action: 'filter' | 'columns' | 'import' | 'export') {
  const actionText = {
    filter: '筛选',
    columns: '字段配置',
    import: '导入',
    export: '导出',
  }[action];
  listMessage.value = `${actionText}入口已保留，后续接入公共抽屉组件。`;
}

function handleAssign(id: string) {
  const service = items.value.find((item) => item.id === id);
  listMessage.value = service ? `${service.code} 已进入处理/指派流程，可在详情中查看关联任务。` : '未找到售后单。';
}

function handleCloseAttempt(record: Record<string, unknown>) {
  const service = items.value.find((item) => item.id === String(record.id));
  if (!service) {
    listMessage.value = '未找到售后单，无法执行关闭校验。';
    return;
  }
  if (['closed', 'closedQualityTracking'].includes(service.status)) {
    listMessage.value = `${service.code} 已结单，无需重复关闭。`;
    return;
  }
  if (!canClose(service.status)) {
    listMessage.value = `${service.code} 派生单据未完成，关闭条件不满足。`;
    return;
  }
  openService(service.id);
}

function closeActionText(record: Record<string, unknown>) {
  const status = String(record.status || '');
  if (status === 'pendingCloseConfirm') return '结单';
  if (['closed', 'closedQualityTracking'].includes(status)) return '已结单';
  return '未满足结单';
}

function closeHint(record: Record<string, unknown>) {
  const status = String(record.status || '');
  if (status === 'pendingCloseConfirm') return '可进入详情执行结单确认';
  if (['closed', 'closedQualityTracking'].includes(status)) return '售后单已结单';
  return '派生单据未完成，暂不能关闭';
}

function canClose(status: string) {
  return status === 'pendingCloseConfirm';
}

function statusTone(status: string) {
  if (['closed', 'closedQualityTracking'].includes(status)) return 'green';
  if (status === 'processing') return 'blue';
  if (status === 'pendingCloseConfirm') return 'yellow';
  if (status === 'escalated') return 'red';
  return 'gray';
}

function priorityTone(priority: string) {
  if (priority === '高') return 'red';
  if (priority === '中') return 'yellow';
  return 'gray';
}

function formatCellValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  return value ?? '-';
}

function safeText(value: unknown) {
  return value == null ? '' : String(value);
}

onMounted(loadData);

watch(
  () => [route.query.sla, route.query.quality],
  ([sla, quality]) => {
    if (sla || quality) {
      columnFilters.value = {};
      keyword.value = '';
      listMessage.value = '';
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.as-list-message {
  margin: 10px 12px 0;
  padding: 9px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #f7fbff;
  color: var(--aw-text);
}

.as-empty-state,
.as-missing-detail {
  margin: 12px;
}

.as-empty-state {
  padding: 12px;
  border: 1px dashed var(--aw-border);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-muted);
}
</style>
