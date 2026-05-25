<template>
  <page-shell :title="title" :description="description">
    <template #actions>
      <a-button type="primary">新增</a-button>
    </template>

    <filter-bar @search="handleSearch" />
    <contract-table
      :columns="columns"
      :items="items"
      :loading="loading"
      :pagination="pagination"
      @page-change="handlePageChange"
    />
  </page-shell>
</template>

<script setup lang="ts" generic="T extends { id: string }">
import { computed, onMounted, reactive, ref } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import PageShell from '@/components/page-shell/PageShell.vue';
import FilterBar from '@/components/filter-bar/FilterBar.vue';
import ContractTable from '@/components/data-table/ContractTable.vue';
import type { ListQuery, PageInfo, PageResult } from '@/app/api/shared/types';

const props = defineProps<{
  title: string;
  description: string;
  columns: TableColumnsType<T>;
  loader: (query?: ListQuery, mode?: 'mock' | 'remote') => Promise<PageResult<T>>;
}>();

const loading = ref(false);
const items = ref<T[]>([]);
const page = reactive<PageInfo>({ pageNo: 1, pageSize: 20, total: 0, pages: 1 });
const query = reactive<ListQuery>({ pageNo: 1, pageSize: 20 });

const pagination = computed(() => ({
  current: page.pageNo,
  pageSize: page.pageSize,
  total: page.total,
  showSizeChanger: true,
}));

async function loadData() {
  loading.value = true;
  try {
    const result = await props.loader(query);
    items.value = result.items;
    Object.assign(page, result.page);
  } finally {
    loading.value = false;
  }
}

function handleSearch(payload: Pick<ListQuery, 'keyword' | 'status'>) {
  Object.assign(query, payload, { pageNo: 1 });
  loadData();
}

function handlePageChange(nextPage: Pick<PageInfo, 'pageNo' | 'pageSize'>) {
  Object.assign(query, nextPage);
  loadData();
}

onMounted(loadData);
</script>
