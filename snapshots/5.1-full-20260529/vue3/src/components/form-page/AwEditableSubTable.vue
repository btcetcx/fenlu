<template>
  <div class="aw-doc-tbl-wrap">
    <div class="aw-doc-tbl-inner">
      <table class="aw-doc-tbl">
        <thead>
          <tr>
            <th style="width:60px">序号</th>
            <th v-for="column in columns" :key="column.key" :style="{ width: column.width ? `${column.width}px` : undefined }">
              {{ column.title }}
            </th>
            <th v-if="$slots.actions" :style="{ width: actionWidth ? `${actionWidth}px` : undefined }">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="String(row[rowKey])">
            <td>{{ index + 1 }}</td>
            <td v-for="column in columns" :key="column.key">
              <slot name="cell" :column="column" :row="row" :index="index" />
            </td>
            <td v-if="$slots.actions">
              <slot name="actions" :row="row" :index="index" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <button v-if="showAdd" class="aw-tool-btn" type="button" style="margin-top:10px" @click="emit('add')">{{ addText }}</button>
</template>

<script setup lang="ts">
import type { EditableColumn } from './types';

withDefaults(
  defineProps<{
    columns: EditableColumn[];
    rows: Record<string, any>[];
    rowKey?: string;
    addText: string;
    actionWidth?: number;
    showAdd?: boolean;
  }>(),
  {
    rowKey: 'id',
    actionWidth: 90,
    showAdd: true,
  },
);

const emit = defineEmits<{
  add: [];
}>();
</script>
