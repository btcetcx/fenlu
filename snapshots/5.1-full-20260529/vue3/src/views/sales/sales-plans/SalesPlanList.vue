<template>
  <sales-plan-create v-if="route.query.action === 'new'" @back="goList" />
  <sales-plan-setting-page v-else-if="route.query.setting" @back="goList" />
  <sales-plan-detail v-else-if="route.query.planId || route.query.id" :id="String(route.query.planId || route.query.id)" @back="goList" />
  <aw-list-page v-else>
    <aw-list-toolbar
      :search-placeholder="salesPlanListConfig.toolbar.searchPlaceholder"
      :create-label="salesPlanListConfig.toolbar.createLabel"
      :actions="salesPlanListConfig.toolbar.actions"
      @search="handleSearch"
      @refresh="loadData"
      @filter="handleToolbarAction"
      @columns="handleToolbarAction"
      @import="handleToolbarAction"
      @export="handleToolbarAction"
      @create="createPlan"
    />

    <aw-data-table
      :columns="salesPlanListConfig.table.columns"
      :rows="tableRows"
      :row-key="salesPlanListConfig.table.rowKey"
      :total="filteredItems.length"
      :bulk-actions="salesPlanListConfig.table.bulkActions"
      :filter-values="columnFilters"
      @selection-change="handleSelectionChange"
      @batch-action="handleBatchAction"
      @column-filter="handleColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'name'" class="aw-link" @click="openPlan(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'achievementText'" :class="['aw-status', achievementTone(record.achievementRate)]">{{ value }}</span>
        <span v-else-if="column.key === 'statusName'" :class="['aw-status', statusTone(record.status)]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openPlan(record.id as string)">查看</span>
        <span v-else>{{ formatCellValue(value, column.numeric) }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ListQuery } from '@/app/api/shared/types';
import { listSalesPlans } from '@/app/api/sales/resources';
import type { SalesPlan } from '@/app/api/sales/types';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import SalesPlanCreate from './SalesPlanCreate.vue';
import SalesPlanDetail from './SalesPlanDetail.vue';
import SalesPlanSettingPage from './SalesPlanSettingPage.vue';
import { salesPlanListConfig } from './salesPlanList.config';

const router = useRouter();
const route = useRoute();
const items = ref<SalesPlan[]>([]);
const keyword = ref('');
const selectedKeys = ref<string[]>([]);
const columnFilters = ref<Record<string, string>>({});
const query: ListQuery = { pageNo: 1, pageSize: 20 };

const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const statusMatched = !columnFilters.value.statusName || item.statusName === columnFilters.value.statusName;
    const keywordMatched =
      !term ||
      [
        item.name,
        item.code,
        item.productSummary,
        `${item.cycleStart} ${item.cycleEnd}`,
        item.ownerName,
        item.statusName,
      ].some((value) => value?.includes(term));
    return statusMatched && keywordMatched;
  });
});

const tableRows = computed<Record<string, unknown>[]>(() =>
  filteredItems.value.map((item) => ({
    ...item,
    cycle: `${item.cycleStart} ~ ${item.cycleEnd}`,
    achievementText: `${item.achievementRate}%`,
    action: '查看',
  })),
);

async function loadData() {
  const result = await listSalesPlans(query);
  items.value = result.items;
}

function handleSearch(value: string) {
  keyword.value = value;
}

function openPlan(id: string) {
  router.push({ path: '/sales/sales-plans', query: { planId: id } });
}

function createPlan() {
  router.push({ path: '/sales/sales-plans', query: { action: 'new' } });
}

function goList() {
  router.push('/sales/sales-plans');
}

function handleSelectionChange(keys: string[]) {
  selectedKeys.value = keys;
}

function handleBatchAction(_actionKey: string, keys: string[]) {
  selectedKeys.value = keys;
}

function handleColumnFilter(columnKey: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [columnKey]: value };
}

function handleToolbarAction() {
  // Drawers/import/export follow the accepted sales list mother template and stay visual in this pass.
}

function statusTone(status: unknown) {
  if (status === 'completed') return 'green';
  if (status === 'executing') return 'blue';
  if (status === 'pendingApproval') return 'yellow';
  if (status === 'paused' || status === 'closed') return 'gray';
  if (status === 'notStarted') return 'gray';
  return '';
}

function achievementTone(rate: unknown) {
  const value = Number(rate || 0);
  if (value >= 100) return 'green';
  if (value > 0) return 'blue';
  return 'gray';
}

function formatCellValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  return value ?? '-';
}

onMounted(loadData);
watch(() => route.query, loadData);
</script>
