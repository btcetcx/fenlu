<template>
  <sales-order-create v-if="currentView === 'new'" @back="goList" />
  <sales-order-detail v-else-if="currentView === 'detail' && activeOrder" :order="activeOrder" @back="goList" />
  <sales-order-setting-page v-else-if="currentView === 'setting'" />
  <aw-list-page v-else>
    <aw-list-toolbar
      :search-placeholder="salesOrderListConfig.toolbar.searchPlaceholder"
      :create-label="salesOrderListConfig.toolbar.createLabel"
      :actions="salesOrderListConfig.toolbar.actions"
      @search="handleSearch"
      @refresh="loadData"
      @filter="handleToolbarAction"
      @columns="handleToolbarAction"
      @import="handleToolbarAction"
      @export="handleToolbarAction"
      @create="handleCreate"
    />

    <aw-data-table
      :columns="salesOrderListConfig.table.columns"
      :rows="tableRows"
      :row-key="salesOrderListConfig.table.rowKey"
      :total="filteredItems.length"
      :bulk-actions="salesOrderListConfig.table.bulkActions"
      :filter-values="columnFilters"
      @selection-change="handleSelectionChange"
      @batch-action="handleBatchAction"
      @column-filter="handleColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'topic'" class="aw-link" @click="openOrder(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'creditCheckName'" :class="['aw-status', statusTone(record.creditCheckStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'creditHoldName'" :class="['aw-status', statusTone(record.creditHoldStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'invoiceRequestName'" :class="['aw-status', statusTone(record.invoiceRequestStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'progressName'" :class="['aw-status', statusTone(record.progressStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'statusName'" :class="['aw-status', statusTone(record.status)]">{{ value }}</span>
        <span v-else-if="column.key === 'exceptionTag' && value" class="aw-status yellow">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openOrder(record.id as string)">查看</span>
        <span v-else>{{ formatCellValue(value, column.numeric) }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ListQuery } from '@/app/api/shared/types';
import { listSalesOrders } from '@/app/api/sales/resources';
import type { SalesOrder } from '@/app/api/sales/types';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import SalesOrderCreate from './SalesOrderCreate.vue';
import SalesOrderDetail from './SalesOrderDetail.vue';
import SalesOrderSettingPage from './SalesOrderSettingPage.vue';
import { salesOrderListConfig } from './salesOrderList.config';

const router = useRouter();
const route = useRoute();
const items = ref<SalesOrder[]>([]);
const keyword = ref('');
const selectedKeys = ref<string[]>([]);
const columnFilters = ref<Record<string, string>>({});
const query: ListQuery = { pageNo: 1, pageSize: 20 };

const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const statusMatched = !columnFilters.value.statusName || item.statusName === columnFilters.value.statusName;
    const progressMatched = !columnFilters.value.progressName || item.progressName === columnFilters.value.progressName;
    const keywordMatched =
      !term ||
      [item.topic, item.code, item.sourceType, item.sourceCode, item.contractSource, item.customerName, item.creditCheckName, item.creditHoldName, item.invoiceRequestName, item.progressName, item.statusName, item.ownerName, item.exceptionTag].some((value) => value?.includes(term));
    return statusMatched && progressMatched && keywordMatched;
  });
});

const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, action: '查看' })));
const activeAction = computed(() => String(route.query.action || ''));
const activeOrderId = computed(() => String(route.query.id || route.query.orderId || ''));
const activeSetting = computed(() => String(route.query.setting || ''));
const activeOrder = computed(() => items.value.find((item) => item.id === activeOrderId.value) || items.value[0]);
const currentView = computed(() => {
  if (activeSetting.value) return 'setting';
  if (activeAction.value === 'new') return 'new';
  if (activeOrderId.value) return 'detail';
  return 'list';
});
async function loadData() {
  const result = await listSalesOrders(query);
  items.value = result.items;
}

function handleSearch(value: string) {
  keyword.value = value;
}

function openOrder(id: string) {
  router.push({ path: '/sales/sales-orders', query: { id } });
}

function goList() {
  router.push('/sales/sales-orders');
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
  // Filter/column/import/export drawers follow the accepted list-page mother template.
}

function handleCreate() {
  router.push({ path: '/sales/sales-orders', query: { action: 'new' } });
}

function statusTone(status: unknown) {
  if (['passed', 'held', 'requested', 'shipped', 'approved', 'confirmed', 'completed'].includes(String(status))) return 'green';
  if (['pendingApproval', 'shipping'].includes(String(status))) return 'blue';
  if (['pending', 'waiting', 'nearLimit', 'cashPending', 'production'].includes(String(status))) return 'yellow';
  if (['failed', 'rejected', 'disabled', 'cancelled', 'blocked', 'notHeld', 'notRequested', 'draft', 'notShipped'].includes(String(status))) return 'gray';
  return '';
}

function formatCellValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  return value ?? '-';
}

onMounted(loadData);
</script>
