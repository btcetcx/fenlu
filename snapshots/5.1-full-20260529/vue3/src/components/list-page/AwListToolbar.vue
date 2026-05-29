<template>
  <div class="aw-list-toolbar">
    <div class="aw-toolbar-left">
      <div class="aw-search">
        <span class="aw-line-icon line-search" />
        <input :placeholder="searchPlaceholder" @input="handleInput" />
      </div>
    </div>
    <div class="aw-toolbar-right">
      <button
        v-for="action in actionItems"
        :key="action.key"
        :class="action.className"
        type="button"
        @click="emitAction(action.key)"
      >
        <span :class="['aw-line-icon', action.icon]" />{{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ToolbarActionKey } from './types';

const actionMeta: Record<ToolbarActionKey, { label: string; icon: string; className: string }> = {
  refresh: { label: '刷新数据', icon: 'line-refresh', className: 'aw-refresh-action' },
  filter: { label: '筛选', icon: 'line-filter', className: 'aw-tool-btn' },
  columns: { label: '字段配置', icon: 'line-columns', className: 'aw-tool-btn' },
  import: { label: '导入', icon: 'line-upload', className: 'aw-tool-btn' },
  export: { label: '导出', icon: 'line-download', className: 'aw-tool-btn' },
  create: { label: '新增', icon: 'line-plus', className: 'aw-btn primary' },
};

const props = withDefaults(
  defineProps<{
    searchPlaceholder?: string;
    createLabel?: string;
    actions?: ToolbarActionKey[];
  }>(),
  {
    searchPlaceholder: '全局搜索',
    createLabel: '新增',
    actions: () => ['refresh', 'filter', 'columns', 'import', 'export', 'create'],
  },
);

const emit = defineEmits<{
  search: [keyword: string];
  refresh: [];
  filter: [];
  columns: [];
  import: [];
  export: [];
  create: [];
}>();

const actionItems = computed(() =>
  props.actions.map((key) => ({
    key,
    ...actionMeta[key],
    label: key === 'create' ? props.createLabel : actionMeta[key].label,
  })),
);

function handleInput(event: Event) {
  emit('search', (event.target as HTMLInputElement).value);
}

function emitAction(key: ToolbarActionKey) {
  if (key === 'refresh') emit('refresh');
  if (key === 'filter') emit('filter');
  if (key === 'columns') emit('columns');
  if (key === 'import') emit('import');
  if (key === 'export') emit('export');
  if (key === 'create') emit('create');
}
</script>
