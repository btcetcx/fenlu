<template>
  <div class="filter-bar">
    <a-input-search
      v-model:value="keyword"
      allow-clear
      placeholder="搜索名称、编号、客户、负责人"
      style="width: 320px"
      @search="emitSearch"
    />
    <a-select
      v-model:value="status"
      allow-clear
      placeholder="状态"
      style="width: 160px"
      :options="statusOptions"
      @change="emitSearch"
    />
    <a-button @click="emitSearch">查询</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  search: [payload: { keyword?: string; status?: string }];
}>();

const keyword = ref('');
const status = ref<string>();

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '审核中', value: 'pendingApproval' },
  { label: '已审核/批准', value: 'approved' },
  { label: '执行中', value: 'executing' },
  { label: '已关闭', value: 'closed' },
];

function emitSearch() {
  emit('search', {
    keyword: keyword.value || undefined,
    status: status.value,
  });
}
</script>
