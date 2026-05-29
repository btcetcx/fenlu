<template>
  <aw-list-page>
    <template #tree>
      <aw-resource-tree v-model="pickedGroup" :title="customerListConfig.tree.title" :total="items.length" :nodes="treeNodes" />
    </template>

    <aw-list-toolbar
      :search-placeholder="customerListConfig.toolbar.searchPlaceholder"
      :create-label="customerListConfig.toolbar.createLabel"
      :actions="customerListConfig.toolbar.actions"
      @search="handleSearch"
      @refresh="loadData"
      @filter="handleToolbarAction"
      @columns="handleToolbarAction"
      @import="handleToolbarAction"
      @export="handleToolbarAction"
      @create="router.push('/sales/customers/new')"
    />

    <aw-data-table
      :columns="customerListConfig.table.columns"
      :rows="tableRows"
      :row-key="customerListConfig.table.rowKey"
      :total="filteredItems.length"
      :bulk-actions="customerListConfig.table.bulkActions"
      @selection-change="handleSelectionChange"
      @batch-action="handleBatchAction"
    >
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'name'" class="aw-link" @click="openDetail(record.id as string)">{{ value }}</span>
        <span v-else-if="column.key === 'creditStatusName'" :class="['aw-status', statusTone(record.creditStatus)]">{{ value }}</span>
        <span v-else-if="column.key === 'statusName'" :class="['aw-status', statusTone(record.status)]">{{ value }}</span>
        <span v-else-if="column.key === 'action'" class="aw-link" @click="openDetail(record.id as string)">查看</span>
        <span v-else>{{ value }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ListQuery } from '@/app/api/shared/types';
import { listCustomers } from '@/app/api/sales/resources';
import type { Customer } from '@/app/api/sales/types';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';
import type { AwTreeNode } from '@/components/list-page/types';
import { customerListConfig } from './customerList.config';

const router = useRouter();
const items = ref<Customer[]>([]);
const pickedGroup = ref('all');
const keyword = ref('');
const selectedKeys = ref<string[]>([]);
const query: ListQuery = { pageNo: 1, pageSize: 20 };

const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const groupMatched = pickedGroup.value === 'all' || item.groupName === pickedGroup.value;
    const keywordMatched =
      !term ||
      [item.name, item.contactName, item.contactPhone, item.managerName, item.groupName].some((value) => value?.includes(term));
    return groupMatched && keywordMatched;
  });
});

const tableRows = computed<Record<string, unknown>[]>(() =>
  filteredItems.value.map((item) => ({
    ...item,
    action: '查看',
  })),
);

const treeNodes = computed<AwTreeNode[]>(() => {
  const groupCounts = items.value.reduce<Record<string, number>>((result, item) => {
    result[item.groupName] = (result[item.groupName] || 0) + 1;
    return result;
  }, {});
  return [
    { key: 'all', label: '全部客户', count: items.value.length, icon: 'line-users', level: 2, open: true },
    { key: 'group-title', label: customerListConfig.tree.rootLabel, icon: 'line-users', level: 2, open: true, disabled: true },
    ...customerListConfig.tree.groups.map((group) => ({
      key: group,
      label: group,
      count: groupCounts[group] || 0,
      icon: 'line-node',
      level: 3 as const,
    })),
  ];
});

async function loadData() {
  const result = await listCustomers(query);
  items.value = result.items;
}

function handleSearch(value: string) {
  keyword.value = value;
}

function openDetail(id: string) {
  router.push(`/sales/customers/${id}`);
}

function handleSelectionChange(keys: string[]) {
  selectedKeys.value = keys;
}

function handleBatchAction(_actionKey: string, keys: string[]) {
  selectedKeys.value = keys;
}

function handleToolbarAction() {
  // Drawers/import/export will be wired after the list shell is accepted.
}

function statusTone(status: unknown) {
  if (status === 'normal' || status === 'approved') return 'green';
  if (status === 'nearLimit' || status === 'pending') return 'yellow';
  if (status === 'disabled') return 'gray';
  return '';
}

onMounted(loadData);
</script>
