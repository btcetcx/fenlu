<template>
  <sales-contract-create v-if="route.query.action === 'new'" />
  <sales-contract-setting-page v-else-if="route.query.setting" />
  <sales-contract-detail v-else-if="route.query.contractId || route.query.id" />
  <aw-list-page v-else>
    <aw-list-toolbar
      :search-placeholder="salesContractListConfig.toolbar.searchPlaceholder"
      :create-label="salesContractListConfig.toolbar.createLabel"
      :actions="salesContractListConfig.toolbar.actions"
      @search="handleSearch"
      @refresh="loadData"
      @filter="handleToolbarAction"
      @columns="handleToolbarAction"
      @import="handleToolbarAction"
      @export="handleToolbarAction"
      @create="openCreate"
    />

    <aw-data-table
      :columns="salesContractListConfig.table.columns"
      :rows="tableRows"
      :row-key="salesContractListConfig.table.rowKey"
      :total="filteredItems.length"
      :bulk-actions="salesContractListConfig.table.bulkActions"
      :filter-values="columnFilters"
      @selection-change="handleSelectionChange"
      @batch-action="handleBatchAction"
      @column-filter="handleColumnFilter"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'topic'" class="aw-link" @click="openContract(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'executionStatusName'" :class="['aw-status', statusTone(record.executionStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openContract(record.id as string)">查看</span>
        <span v-else>{{ formatCellValue(value, column.numeric) }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ListQuery } from '@/app/api/shared/types';
import { listSalesContracts } from '@/app/api/sales/resources';
import type { SalesContract } from '@/app/api/sales/types';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import SalesContractCreate from './SalesContractCreate.vue';
import SalesContractDetail from './SalesContractDetail.vue';
import SalesContractSettingPage from './SalesContractSettingPage.vue';
import { salesContractListConfig } from './salesContractList.config';

const router = useRouter();
const route = useRoute();
const items = ref<SalesContract[]>([]);
const keyword = ref('');
const selectedKeys = ref<string[]>([]);
const columnFilters = ref<Record<string, string>>({});
const query: ListQuery = { pageNo: 1, pageSize: 20 };

const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const executionMatched = !columnFilters.value.executionStatusName || item.executionStatusName === columnFilters.value.executionStatusName;
    const keywordMatched =
      !term ||
      [item.topic, item.code, item.customerName, item.sourceCode, item.signedDate, item.expireDate, item.executionStatusName, item.statusName, item.ownerName].some((value) => value?.includes(term));
    return executionMatched && keywordMatched;
  });
});

const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, action: '查看' })));

async function loadData() {
  const result = await listSalesContracts(query);
  items.value = result.items;
}

function handleSearch(value: string) {
  keyword.value = value;
}

function openContract(id: string) {
  router.push({ path: '/sales/sales-contracts', query: { contractId: id } });
}

function openCreate() {
  router.push({ path: '/sales/sales-contracts', query: { action: 'new' } });
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
  // Drawers/import/export/create will be wired after the contract list shell is accepted.
}

function statusTone(status: unknown) {
  if (status === 'completed') return 'green';
  if (status === 'performing') return '';
  if (status === 'pendingExecution' || status === 'pendingApproval') return 'yellow';
  if (status === 'disabled' || status === 'terminated') return 'gray';
  return '';
}

function formatCellValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
  return value ?? '-';
}

onMounted(loadData);
</script>
