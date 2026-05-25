<template>
  <div class="aw-list-toolbar">
    <div class="aw-toolbar-left">
      <div class="aw-search">
        <span class="aw-line-icon line-search" />
        <input :placeholder="searchPlaceholder" @input="handleInput" />
      </div>
    </div>
    <div class="aw-toolbar-right">
      <button class="aw-refresh-action" type="button"><span class="aw-line-icon line-refresh" />刷新数据</button>
      <button class="aw-tool-btn" type="button"><span class="aw-line-icon line-filter" />筛选</button>
      <button class="aw-tool-btn" type="button"><span class="aw-line-icon line-columns" />字段配置</button>
      <button class="aw-tool-btn" type="button"><span class="aw-line-icon line-upload" />导入</button>
      <button class="aw-tool-btn" type="button"><span class="aw-line-icon line-download" />导出</button>
      <button class="aw-btn primary" type="button" @click="emit('create')"><span class="aw-line-icon line-plus" />{{ createLabel }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    searchPlaceholder?: string;
    createLabel?: string;
  }>(),
  {
    searchPlaceholder: '全局搜索',
    createLabel: '新增',
  },
);

const emit = defineEmits<{
  search: [keyword: string];
  create: [];
}>();

function handleInput(event: Event) {
  emit('search', (event.target as HTMLInputElement).value);
}
</script>
