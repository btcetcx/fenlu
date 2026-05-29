<template>
  <div class="aw-detail-metrics">
    <div v-for="item in items" :key="item.label" class="aw-detail-metric">
      <span>{{ item.label }}</span>
      <strong>{{ formatValue(item.value) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DetailMetricItem } from './types';

const props = defineProps<{
  items: DetailMetricItem[];
  formatter?: (value: DetailMetricItem['value']) => string;
}>();

function formatValue(value: DetailMetricItem['value']) {
  return props.formatter ? props.formatter(value) : String(value);
}
</script>
