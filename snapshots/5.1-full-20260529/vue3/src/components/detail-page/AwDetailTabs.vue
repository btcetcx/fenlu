<template>
  <div class="aw-detail-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['aw-detail-tab', { on: modelValue === tab.key }]"
      type="button"
      @click="selectTab(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
  <slot :active-key="modelValue" />
</template>

<script setup lang="ts">
import type { DetailTabItem } from './types';

defineProps<{
  modelValue: string;
  tabs: DetailTabItem[];
}>();

const emit = defineEmits<{
  'update:modelValue': [key: string];
  change: [key: string];
}>();

function selectTab(key: string) {
  emit('update:modelValue', key);
  emit('change', key);
}
</script>
