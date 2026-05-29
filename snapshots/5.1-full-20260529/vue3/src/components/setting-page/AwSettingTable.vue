<script setup lang="ts">
import type { SettingTableColumn, SettingTableRow } from './types';

defineProps<{
  columns: SettingTableColumn[];
  rows: SettingTableRow[];
}>();

defineEmits<{
  (event: 'delete', row: SettingTableRow): void;
  (event: 'edit', row: SettingTableRow): void;
}>();
</script>

<template>
  <div class="aw-doc-tbl-wrap">
    <div class="aw-doc-tbl-inner">
      <table class="aw-doc-tbl">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">{{ column.label }}</th>
            <th style="width:150px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row.id">
            <td v-for="column in columns" :key="column.key">
              <slot name="cell" :column="column" :index="index" :row="row">
                <span>{{ row[column.key] }}</span>
              </slot>
            </td>
            <td>
              <slot name="actions" :row="row">
                <span class="aw-link" @click="$emit('edit', row)">编辑</span>
                <span class="aw-action-split">|</span>
                <span class="aw-link" style="color:var(--aw-danger)" @click="$emit('delete', row)">删除</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
