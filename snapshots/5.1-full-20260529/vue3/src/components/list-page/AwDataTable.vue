<template>
  <div class="aw-doc-tbl-wrap">
    <div class="aw-doc-tbl-inner">
      <table :class="['aw-doc-tbl', { 'aw-doc-tbl-fit': fitWidth }]">
        <thead>
          <tr>
            <th class="aw-check-col aw-sticky-left-1">
              <label class="aw-check">
                <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked && !allChecked" @change="toggleAll" />
                <span />
              </label>
            </th>
            <th class="aw-index-col aw-sticky-left-2"><div class="aw-th-inner">序号</div></th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'aw-sticky-right': column.fixed === 'right' }"
              :style="{ width: column.width ? `${column.width}px` : undefined }"
            >
              <div class="aw-th-inner">
                <span>{{ column.title }}</span>
                <select
                  v-if="column.filterOptions?.length"
                  class="aw-th-filter"
                  :value="filterValues[column.key] || ''"
                  @click.stop
                  @change="emitColumnFilter(column.key, $event)"
                >
                  <option value="">全部</option>
                  <option v-for="option in column.filterOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="String(row[rowKey])">
            <td class="aw-sticky-left-1">
              <label class="aw-check" @click.stop>
                <input type="checkbox" :checked="selectedKeys.has(String(row[rowKey]))" @change="toggleRow(String(row[rowKey]))" />
                <span />
              </label>
            </td>
            <td class="aw-num aw-sticky-left-2">{{ index + 1 }}</td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="{ 'aw-num': column.numeric, 'aw-link': column.link, 'aw-sticky-right': column.fixed === 'right' }"
            >
              <slot name="cell" :column="column" :record="row" :value="row[column.key]">
                {{ formatValue(row[column.key], column.numeric) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="aw-list-footer">
    <div class="aw-footer-left">
      <label class="aw-check">
        <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked && !allChecked" @change="toggleAll" />
        <span />
      </label>
      <span>共 {{ total }} 条</span>
      <span>已选 {{ selectedKeys.size }} 条</span>
      <button v-for="action in bulkActions" :key="action.key" class="aw-bulk-btn" type="button" @click="emit('batch-action', action.key, selectedKeyList)">
        {{ action.label }}
      </button>
    </div>
    <div class="aw-pagination">
      <button type="button">上一页</button>
      <button class="on" type="button">1</button>
      <button type="button">2</button>
      <button type="button">3</button>
      <button type="button">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { AwBulkAction, AwTableColumn } from './types';

const props = withDefaults(
  defineProps<{
    columns: AwTableColumn[];
    rows: Record<string, unknown>[];
    rowKey?: string;
    total?: number;
    bulkActions?: AwBulkAction[];
    filterValues?: Record<string, string>;
    fitWidth?: boolean;
  }>(),
  {
    rowKey: 'id',
    total: 0,
    filterValues: () => ({}),
    fitWidth: false,
    bulkActions: () => [
      { key: 'transfer', label: '批量转移' },
      { key: 'assign', label: '批量指定' },
    ],
  },
);

const emit = defineEmits<{
  'selection-change': [keys: string[]];
  'batch-action': [actionKey: string, keys: string[]];
  'column-filter': [columnKey: string, value: string];
}>();

const selectedKeys = ref(new Set<string>());
const allChecked = computed(() => props.rows.length > 0 && props.rows.every((row) => selectedKeys.value.has(String(row[props.rowKey]))));
const someChecked = computed(() => props.rows.some((row) => selectedKeys.value.has(String(row[props.rowKey]))));
const selectedKeyList = computed(() => Array.from(selectedKeys.value));

watch(
  () => props.rows.map((row) => String(row[props.rowKey])),
  (visibleKeys) => {
    const visibleSet = new Set(visibleKeys);
    const next = new Set(Array.from(selectedKeys.value).filter((key) => visibleSet.has(key)));
    if (next.size !== selectedKeys.value.size) {
      selectedKeys.value = next;
      emit('selection-change', selectedKeyList.value);
    }
  },
);

function toggleAll() {
  if (allChecked.value) {
    selectedKeys.value = new Set();
    emit('selection-change', selectedKeyList.value);
    return;
  }
  selectedKeys.value = new Set(props.rows.map((row) => String(row[props.rowKey])));
  emit('selection-change', selectedKeyList.value);
}

function toggleRow(key: string) {
  const next = new Set(selectedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedKeys.value = next;
  emit('selection-change', selectedKeyList.value);
}

function emitColumnFilter(columnKey: string, event: Event) {
  emit('column-filter', columnKey, (event.target as HTMLSelectElement).value);
}

function formatValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value ?? '-';
}
</script>

<style scoped>
.aw-doc-tbl-fit {
  min-width: 100%;
  table-layout: fixed;
}

.aw-doc-tbl-fit th,
.aw-doc-tbl-fit td {
  white-space: nowrap;
}
</style>
