<template>
  <aw-list-page>
    <template #tree>
      <aw-resource-tree v-model="pickedGroup" title="客户库" :total="items.length" :nodes="treeNodes" />
    </template>

    <aw-list-toolbar
      search-placeholder="全局搜索（如客户名称、联系人、客户经理）"
      create-label="新增客户"
      @search="handleSearch"
      @create="router.push('/sales/customers/new')"
    />

    <aw-data-table :columns="columns" :rows="tableRows" :total="filteredItems.length">
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
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ListQuery, PageInfo } from '@/app/api/shared/types';
import { listCustomers } from '@/app/api/sales/resources';
import type { Customer } from '@/app/api/sales/types';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';

interface AwTableColumn {
  key: string;
  title: string;
  width?: number;
  numeric?: boolean;
  link?: boolean;
  fixed?: 'right';
}

interface AwTreeNode {
  key: string;
  label: string;
  count?: number;
  icon?: string;
  level?: 2 | 3;
  open?: boolean;
  disabled?: boolean;
}

const loading = ref(false);
const router = useRouter();
const items = ref<Customer[]>([]);
const pickedGroup = ref('all');
const keyword = ref('');
const page = reactive<PageInfo>({ pageNo: 1, pageSize: 20, total: 0, pages: 1 });
const query = reactive<ListQuery>({ pageNo: 1, pageSize: 20 });

const columns: AwTableColumn[] = [
  { title: '客户名称', key: 'name', width: 220, link: true },
  { title: '客户分组', key: 'groupName', width: 120 },
  { title: '主联系人', key: 'contactName', width: 100 },
  { title: '职位', key: 'contactPosition', width: 110 },
  { title: '联系方式', key: 'contactPhone', width: 130, numeric: true },
  { title: '信用额度', key: 'creditLimit', width: 120, numeric: true },
  { title: '已用额度', key: 'creditUsed', width: 120, numeric: true },
  { title: '占用额度', key: 'creditHold', width: 120, numeric: true },
  { title: '应收未收', key: 'receivableAmount', width: 120, numeric: true },
  { title: '可用额度', key: 'creditAvailable', width: 120, numeric: true },
  { title: '账期', key: 'paymentTerm', width: 110 },
  { title: '信用状态', key: 'creditStatusName', width: 100 },
  { title: '客户经理', key: 'managerName', width: 110 },
  { title: '状态', key: 'statusName', width: 100 },
  { title: '操作', key: 'action', width: 90, fixed: 'right' },
];

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
    { key: 'group-title', label: '客户分组', icon: 'line-users', level: 2, open: true, disabled: true },
    ...['重点客户', '战略客户', '普通客户', '渠道客户'].map((group) => ({
      key: group,
      label: group,
      count: groupCounts[group] || 0,
      icon: 'line-node',
      level: 3 as const,
    })),
  ];
});

async function loadData() {
  loading.value = true;
  try {
    const result = await listCustomers(query);
    items.value = result.items;
    Object.assign(page, result.page);
  } finally {
    loading.value = false;
  }
}

function handleSearch(value: string) {
  keyword.value = value;
}

function openDetail(id: string) {
  router.push(`/sales/customers/${id}`);
}

function statusTone(status: unknown) {
  if (status === 'normal' || status === 'approved') return 'green';
  if (status === 'nearLimit' || status === 'pending') return 'yellow';
  if (status === 'disabled') return 'gray';
  return '';
}

onMounted(loadData);
</script>
