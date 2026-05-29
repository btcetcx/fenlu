<script setup lang="ts">
import type { SettingTreeItem } from './types';

defineProps<{
  activeKey?: string | number;
  addTitle?: string;
  items: SettingTreeItem[];
  showAdd?: boolean;
  title: string;
}>();

defineEmits<{
  (event: 'add'): void;
  (event: 'select', key: string | number): void;
}>();
</script>

<template>
  <aside class="aw-setting-tree">
    <div :class="['aw-setting-tree-title', { 'aw-setting-tree-title-row': showAdd }]">
      <span>{{ title }}</span>
      <button
        v-if="showAdd"
        class="aw-icon-btn"
        type="button"
        :title="addTitle || title"
        @click="$emit('add')"
      >
        +
      </button>
    </div>
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :class="['aw-setting-tree-row', { on: activeKey === item.key }]"
      @click="$emit('select', item.key)"
    >
      <span :class="['aw-line-icon', item.icon || 'line-doc']"></span>
      <span>{{ item.label }}</span>
      <em v-if="item.count !== undefined">{{ item.count }}</em>
    </button>
  </aside>
</template>
