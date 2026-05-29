<script setup lang="ts">
import AwSettingListCard from './AwSettingListCard.vue';
import AwSettingSplitPage from './AwSettingSplitPage.vue';
import AwSettingTable from './AwSettingTable.vue';
import AwSettingTree from './AwSettingTree.vue';
import type { SettingTableColumn, SettingTableRow, SettingTreeItem } from './types';

defineProps<{
  activeKey?: string | number;
  columns: SettingTableColumn[];
  description?: string;
  items: SettingTreeItem[];
  keyword?: string;
  rows: SettingTableRow[];
  searchPlaceholder?: string;
  title: string;
  treeTitle: string;
}>();

defineEmits<{
  (event: 'delete', row: SettingTableRow): void;
  (event: 'edit', row: SettingTableRow): void;
  (event: 'select', key: string | number): void;
  (event: 'update:keyword', value: string): void;
}>();
</script>

<template>
  <aw-setting-split-page>
    <template #tree>
      <aw-setting-tree
        :active-key="activeKey"
        :items="items"
        :title="treeTitle"
        @select="$emit('select', $event)"
      />
    </template>
    <aw-setting-list-card
      :keyword="keyword"
      :description="description"
      :search-placeholder="searchPlaceholder"
      :title="title"
      @update:keyword="$emit('update:keyword', $event)"
    >
      <aw-setting-table
        :columns="columns"
        :rows="rows"
        @delete="$emit('delete', $event)"
        @edit="$emit('edit', $event)"
      >
        <template #cell="slotProps">
          <slot name="cell" v-bind="slotProps">
            <span>{{ slotProps.row[slotProps.column.key] }}</span>
          </slot>
        </template>
        <template #actions="slotProps">
          <slot name="actions" v-bind="slotProps">
            <span class="aw-link" @click="$emit('edit', slotProps.row)">编辑</span>
            <span class="aw-action-split">|</span>
            <span class="aw-link" style="color:var(--aw-danger)" @click="$emit('delete', slotProps.row)">删除</span>
          </slot>
        </template>
      </aw-setting-table>
    </aw-setting-list-card>
  </aw-setting-split-page>
</template>
