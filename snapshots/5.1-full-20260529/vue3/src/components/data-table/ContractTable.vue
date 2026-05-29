<template>
  <a-table
    row-key="id"
    size="middle"
    :columns="columns"
    :data-source="items"
    :loading="loading"
    :pagination="pagination"
    @change="handleChange"
  >
    <template #bodyCell="{ column, record }">
      <slot name="bodyCell" :column="column" :record="record" />
    </template>
  </a-table>
</template>

<script setup lang="ts" generic="T extends { id: string }">
import type { TablePaginationConfig } from 'ant-design-vue';
import type { PageInfo } from '@/app/api/shared/types';

defineProps<{
  columns: unknown[];
  items: T[];
  loading?: boolean;
  pagination: false | TablePaginationConfig;
}>();

const emit = defineEmits<{
  pageChange: [page: Pick<PageInfo, 'pageNo' | 'pageSize'>];
}>();

function handleChange(pagination: TablePaginationConfig) {
  emit('pageChange', {
    pageNo: pagination.current || 1,
    pageSize: pagination.pageSize || 20,
  });
}
</script>
