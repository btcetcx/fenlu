<template>
  <div class="aw-doc-tbl-wrap">
    <div class="aw-doc-tbl-inner">
      <table class="aw-doc-tbl">
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
              <div class="aw-th-inner">{{ column.title }}</div>
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
      <button class="aw-bulk-btn" type="button">批量转移</button>
      <button class="aw-bulk-btn" type="button">批量指定</button>
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
import { computed, ref } from 'vue';

export interface AwTableColumn {
  key: string;
  title: string;
  width?: number;
  numeric?: boolean;
  link?: boolean;
  fixed?: 'right';
}

const props = withDefaults(
  defineProps<{
    columns: AwTableColumn[];
    rows: Record<string, unknown>[];
    rowKey?: string;
    total?: number;
  }>(),
  {
    rowKey: 'id',
    total: 0,
  },
);

const selectedKeys = ref(new Set<string>());
const allChecked = computed(() => props.rows.length > 0 && props.rows.every((row) => selectedKeys.value.has(String(row[props.rowKey]))));
const someChecked = computed(() => props.rows.some((row) => selectedKeys.value.has(String(row[props.rowKey]))));

function toggleAll() {
  if (allChecked.value) {
    selectedKeys.value = new Set();
    return;
  }
  selectedKeys.value = new Set(props.rows.map((row) => String(row[props.rowKey])));
}

function toggleRow(key: string) {
  const next = new Set(selectedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedKeys.value = next;
}

function formatValue(value: unknown, numeric?: boolean) {
  if (typeof value === 'number' && numeric) {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value ?? '-';
}
</script>
