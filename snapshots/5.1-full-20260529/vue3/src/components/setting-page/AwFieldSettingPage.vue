<script setup lang="ts">
import { computed, ref } from 'vue';
import AwSettingSplitList from './AwSettingSplitList.vue';
import type { FieldSettingRow, FieldSettingScope, SettingTableRow, SettingTreeItem } from './types';

const props = defineProps<{
  rows: FieldSettingRow[];
  scopes: FieldSettingScope[];
  activeScope?: string;
}>();

const emit = defineEmits<{
  (event: 'delete', row: FieldSettingRow): void;
  (event: 'edit', row: FieldSettingRow): void;
  (event: 'select-scope', key: string): void;
  (event: 'toggle-enabled', row: FieldSettingRow, enabled: boolean): void;
  (event: 'toggle-required', row: FieldSettingRow, required: boolean): void;
}>();

const keyword = ref('');
const currentScope = computed(() => props.activeScope || props.scopes[0]?.key || '');
const treeItems = computed<SettingTreeItem[]>(() => props.scopes.map((scope) => ({
  key: scope.key,
  label: scope.label,
  count: scope.count ?? props.rows.filter((row) => row.scope === scope.key).length,
  icon: 'line-doc',
})));
const filteredRows = computed(() => {
  const text = keyword.value.trim();
  const scopedRows = props.rows.filter((row) => row.scope === currentScope.value);
  if (!text) return scopedRows;
  return scopedRows.filter((row) => [row.name, row.code, row.type].some((value) => String(value).includes(text)));
});
const columns = [
  { key: 'index', label: '序号', width: '70px' },
  { key: 'name', label: '字段名称' },
  { key: 'code', label: '字段编码' },
  { key: 'type', label: '字段类型' },
  { key: 'required', label: '是否必填', width: '110px' },
  { key: 'enabled', label: '是否启用', width: '110px' },
];

function selectScope(key: string | number) {
  keyword.value = '';
  emit('select-scope', String(key));
}
</script>

<template>
  <aw-setting-split-list
    v-model:keyword="keyword"
    :active-key="currentScope"
    :columns="columns"
    description="配置当前区域展示的自定义字段。"
    :items="treeItems"
    :rows="filteredRows"
    search-placeholder="搜索字段名称/编码"
    :title="scopes.find((scope) => scope.key === currentScope)?.label || '字段位置'"
    tree-title="字段位置"
    @delete="emit('delete', $event as FieldSettingRow)"
    @edit="emit('edit', $event as FieldSettingRow)"
    @select="selectScope"
  >
    <template #cell="{ column, row, index }">
      <span v-if="column.key === 'index'">{{ index + 1 }}</span>
      <label v-else-if="column.key === 'required'" class="aw-switch-line mini">
        <input
          :checked="row.required === true || row.required === '是'"
          type="checkbox"
          @change="emit('toggle-required', row as FieldSettingRow, ($event.target as HTMLInputElement).checked)"
        />
        <i></i>
      </label>
      <label v-else-if="column.key === 'enabled'" class="aw-switch-line mini">
        <input
          :checked="row.enabled !== false"
          type="checkbox"
          @change="emit('toggle-enabled', row as FieldSettingRow, ($event.target as HTMLInputElement).checked)"
        />
        <i></i>
      </label>
      <span v-else>{{ (row as SettingTableRow)[column.key] }}</span>
    </template>
  </aw-setting-split-list>
</template>
