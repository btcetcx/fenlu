<template>
  <div class="aw-detail-grid">
    <div v-for="item in items" :key="item.label" class="aw-detail-field">
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DetailFieldItem } from './types';

defineProps<{
  items: DetailFieldItem[];
}>();
</script>
