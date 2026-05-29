<template>
  <aside class="aw-doc-tree">
    <div class="aw-doc-tree-h">
      {{ title }}
      <span class="aw-doc-tree-n">({{ total }})</span>
    </div>
    <div class="aw-doc-tree-list">
      <button
        v-for="node in nodes"
        :key="node.key"
        type="button"
        :class="['aw-tree-row', node.level === 3 ? 'aw-tree-l3' : 'aw-tree-l2', { on: modelValue === node.key, muted: node.disabled }]"
        :disabled="node.disabled"
        @click="$emit('update:modelValue', node.key)"
      >
        <span v-if="node.level !== 3" class="aw-tree-caret">{{ node.open ? '▾' : '' }}</span>
        <span v-if="node.icon?.startsWith('line-')" :class="['aw-line-icon', node.icon]" />
        <span v-else class="aw-tree-ic">{{ node.icon || (node.level === 3 ? '▹' : '▦') }}</span>
        <span class="aw-tree-text">{{ node.label }}</span>
        <span v-if="typeof node.count === 'number'" class="aw-doc-tree-n">({{ node.count }})</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { AwTreeNode } from './types';

withDefaults(
  defineProps<{
    title: string;
    total: number;
    modelValue: string;
    nodes: AwTreeNode[];
  }>(),
  {
    nodes: () => [],
  },
);

defineEmits<{
  'update:modelValue': [key: string];
}>();
</script>
