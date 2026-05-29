<template>
  <aw-detail-page v-if="currentView === 'detail' && activeTask">
    <template #toolbar>
      <aw-detail-toolbar
        back-text="返回任务列表"
        :actions="taskActions"
        @back="goList"
        @action="handleTaskAction"
      />
    </template>
    <template #header>
      <aw-detail-header
        :title="activeTask.topic"
        :code="activeTask.code"
        :status-text="activeTask.status"
        :status-tone="statusTone(activeTask.status)"
        :metas="taskHeaderMetas"
      />
    </template>

    <aw-detail-tabs v-model="activeDetailTab" :tabs="detailTabs" />

    <section v-if="activeDetailTab === 'current'" class="aw-form-card">
      <div class="aw-detail-section-title">当前处理动作</div>
      <aw-detail-info-grid :items="currentActionItems" />
      <div class="as-task-action">
        <button v-if="activeTask.status !== '已完成'" class="aw-btn primary" type="button" @click="advanceTask">推进派生单据状态</button>
        <span v-else class="aw-status green">任务已完成</span>
      </div>
    </section>

    <section v-else-if="activeDetailTab === 'service'" class="aw-form-card">
      <div class="aw-detail-section-title">关联售后单</div>
      <aw-detail-info-grid :items="serviceItems" />
      <button class="aw-tool-btn" type="button" @click="openService(activeTask.serviceId)">查看售后详情</button>
    </section>

    <section v-else-if="activeDetailTab === 'document'" class="aw-form-card">
      <div class="aw-detail-section-title">关联单据</div>
      <aw-editable-sub-table :columns="documentColumns" :rows="documentRows" add-text="添加单据" :show-add="false">
        <template #cell="{ column, row }">
          <span v-if="column.key === 'status'" :class="['aw-status', docTone(String(row.status))]">{{ row.status }}</span>
          <span v-else>{{ row[column.key] }}</span>
        </template>
      </aw-editable-sub-table>
    </section>

    <section v-else class="aw-form-card">
      <div class="aw-detail-section-title">{{ activeDetailTab === 'writeback' ? '回写记录' : '结单确认' }}</div>
      <div class="as-task-logs">
        <div v-for="item in activeLogRows" :key="item" class="as-task-log">{{ item }}</div>
      </div>
    </section>
  </aw-detail-page>

  <section v-else-if="currentView === 'detail'" class="aw-form-card as-task-missing">
    <div class="aw-detail-section-title">任务不存在</div>
    <p>未找到当前售后任务，可能已完成或不在当前数据范围内。</p>
    <button class="aw-btn primary" type="button" @click="goList">返回任务列表</button>
  </section>

  <after-sales-rule-setting-page v-else-if="currentView === 'setting'" scope-title="任务" back-path="/after-sales/tasks" />

  <aw-list-page v-else>
    <template #tree>
      <aw-resource-tree v-model="activeCategory" title="任务分类" :total="items.length" :nodes="treeNodes" />
    </template>
    <aw-list-toolbar
      search-placeholder="搜索任务/售后单/客户"
      create-label="刷新任务"
      @search="keyword = $event"
      @refresh="loadData"
      @filter="noop"
      @columns="noop"
      @import="noop"
      @export="noop"
      @create="loadData"
    />
    <aw-data-table :columns="taskColumns" :rows="tableRows" row-key="id" :total="filteredItems.length" :filter-values="columnFilters" @column-filter="handleColumnFilter">
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'topic'" class="aw-link" @click="openTask(String(record.id))">{{ value }}</span>
        <span v-else-if="column.key === 'status'" :class="['aw-status', statusTone(String(value))]">{{ value }}</span>
        <span v-else-if="column.key === 'linkedDocumentStatus'" :class="['aw-status', docTone(String(value))]">{{ value }}</span>
        <span v-else-if="column.key === 'action'">
          <span class="aw-link" @click="openTask(String(record.id))">查看</span>
          <span class="aw-action-split">|</span>
          <span class="aw-link" @click="openService(String(record.serviceId))">售后单</span>
        </span>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { advanceAfterSalesTask, getAfterSalesService, getAfterSalesTask, listAfterSalesLinkedDocuments, listAfterSalesTasks } from '@/app/api/after-sales/resources';
import type { AfterSalesLinkedDocument, AfterSalesService, AfterSalesTask } from '@/app/api/after-sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';
import AfterSalesRuleSettingPage from './AfterSalesRuleSettingPage.vue';
import { taskColumns } from './afterSalesList.config';

const router = useRouter();
const route = useRoute();
const items = ref<AfterSalesTask[]>([]);
const activeTask = ref<AfterSalesTask>();
const activeService = ref<AfterSalesService>();
const activeDocument = ref<AfterSalesLinkedDocument>();
const keyword = ref('');
const activeCategory = ref('all');
const activeDetailTab = ref('current');
const columnFilters = ref<Record<string, string>>({});
const categories = ['全部任务', '退货入库', '换货出库', '退款处理', '维修派工', '现场服务'];
const actionCategoryMap: Record<string, string> = {
  任务列表: 'all',
  全部任务: 'all',
  退货入库: '退货入库',
  换货出库: '换货出库',
  退款处理: '退款处理',
  维修派工: '维修派工',
  现场服务: '现场服务',
};
const detailTabs = [
  { key: 'current', label: '当前处理动作' },
  { key: 'service', label: '关联售后单' },
  { key: 'document', label: '关联单据' },
  { key: 'writeback', label: '回写记录' },
  { key: 'confirm', label: '结单确认' },
];
const categoryTypeMap: Record<string, string[]> = {
  all: [],
  退货入库: ['退货入库'],
  换货出库: ['换货出库'],
  退款处理: ['退款处理'],
  维修派工: ['维修派工'],
  现场服务: ['现场服务'],
};
const currentView = computed(() => route.query.setting ? 'setting' : route.query.id ? 'detail' : 'list');
const treeNodes = computed(() => categories.map((label) => ({
  key: label === '全部任务' ? 'all' : label,
  label,
  icon: 'line-doc',
  level: 2 as const,
  count: label === '全部任务' ? items.value.length : items.value.filter((item) => categoryMatched(item, label)).length,
})));
const filteredItems = computed(() => {
  const term = keyword.value.trim();
  const statusFilter = String(route.query.status || '');
  return items.value.filter((item) => {
    const categoryOk = activeCategory.value === 'all' || categoryMatched(item, activeCategory.value);
    const statusMatched = !statusFilter || item.status === statusFilter;
    const typeMatched = !columnFilters.value.taskType || item.taskType === columnFilters.value.taskType;
    const keywordMatched = !term || [item.topic, item.code, item.serviceCode, item.customerName, item.ownerName].some((value) => safeText(value).includes(term));
    return categoryOk && statusMatched && typeMatched && keywordMatched;
  });
});
const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, action: '查看' })));
const taskActions = computed(() => activeTask.value?.status === '已完成' ? [] : [{ key: 'advance', label: '推进处理' }]);
const taskHeaderMetas = computed(() => activeTask.value ? [
  { label: '关联售后单', value: activeTask.value.serviceCode },
  { label: '客户', value: activeTask.value.customerName },
  { label: '责任部门', value: activeTask.value.department },
  { label: '责任人', value: activeTask.value.ownerName },
] : []);
const currentActionItems = computed(() => activeTask.value ? [
  { label: '任务类型', value: activeTask.value.taskType },
  { label: '派生单据', value: activeTask.value.linkedDocumentCode },
  { label: '派生单据状态', value: activeTask.value.linkedDocumentStatus },
  { label: '任务状态', value: activeTask.value.status },
  { label: '截止时间', value: activeTask.value.dueAt },
] : []);
const serviceItems = computed(() => activeService.value ? [
  { label: '售后主题', value: activeService.value.topic },
  { label: '售后状态', value: activeService.value.statusName },
  { label: '处理方式', value: activeService.value.handlingMethod },
  { label: '仓储处理', value: activeService.value.warehouseStatus },
  { label: '财务处理', value: activeService.value.financeStatus },
  { label: '结单确认', value: activeService.value.closeConfirmStatus },
] : []);
const documentColumns = [
  { key: 'type', title: '单据类型', width: 130 },
  { key: 'code', title: '单据编号', width: 170 },
  { key: 'status', title: '单据状态', width: 130 },
  { key: 'ownerName', title: '负责人', width: 120 },
  { key: 'updatedAt', title: '更新时间', width: 160 },
];
const documentRows = computed<Record<string, unknown>[]>(() => activeDocument.value ? [activeDocument.value as unknown as Record<string, unknown>] : []);
const activeLogRows = computed(() => {
  if (!activeTask.value) return [];
  if (activeDetailTab.value === 'confirm') {
    return [
      `售后单当前结单状态：${activeService.value?.closeConfirmStatus || '-'}`,
      activeService.value?.status === 'pendingCloseConfirm' ? '派生单据已满足回填规则，可由内部人员在售后详情执行结单确认。' : '派生单据尚未全部完成，暂不可结单。',
    ];
  }
  return activeDocument.value?.writebackLogs || [];
});

async function loadData() {
  const result = await listAfterSalesTasks({ pageNo: 1, pageSize: 100 });
  items.value = result.items;
}

async function loadDetail(id: string) {
  activeTask.value = await getAfterSalesTask(id);
  if (!activeTask.value) {
    activeService.value = undefined;
    activeDocument.value = undefined;
    return;
  }
  activeService.value = await getAfterSalesService(activeTask.value.serviceId);
  const docs = await listAfterSalesLinkedDocuments(activeTask.value.serviceId);
  activeDocument.value = docs.find((doc) => doc.id === activeTask.value?.linkedDocumentId);
}

function openTask(id: string) {
  router.push({ path: '/after-sales/tasks', query: { id } });
}

function openService(id: string) {
  router.push({ path: '/after-sales/services', query: { id } });
}

function goList() {
  router.push('/after-sales/tasks');
  activeDetailTab.value = 'current';
  loadData();
}

async function advanceTask() {
  if (!activeTask.value) return;
  await advanceAfterSalesTask(activeTask.value.id);
  await loadData();
  await loadDetail(activeTask.value.id);
}

async function handleTaskAction(key: string) {
  if (key === 'advance') await advanceTask();
}

function handleColumnFilter(columnKey: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [columnKey]: value };
}

function statusTone(status: string) {
  if (status === '已完成') return 'green';
  if (status === '处理中') return 'blue';
  return 'yellow';
}

function docTone(status: string) {
  if (['已质检', '已签收', '已付款', '已完成', '已关闭', '已调整', '已红冲'].includes(status)) return 'green';
  if (status.startsWith('待')) return 'yellow';
  return 'blue';
}

function categoryMatched(item: AfterSalesTask, category: string) {
  const expected = categoryTypeMap[category] || [category];
  if (!expected.length) return true;
  return expected.some((type) => item.taskType.includes(type));
}

function safeText(value: unknown) {
  return value == null ? '' : String(value);
}

function noop() {}

onMounted(loadData);

watch(
  () => [route.query.category, route.query.action],
  ([category, action]) => {
    activeCategory.value = String(category || actionCategoryMap[String(action || '')] || 'all');
  },
  { immediate: true },
);

watch(
  () => route.query.id,
  (id) => {
    if (id) loadDetail(String(id));
  },
  { immediate: true },
);
</script>

<style scoped>
.as-task-action {
  margin-top: 14px;
}

.as-task-logs {
  display: grid;
  gap: 8px;
}

.as-task-log {
  padding: 10px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
}

.as-task-missing {
  margin: 12px;
}
</style>
