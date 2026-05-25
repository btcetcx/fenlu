<template>
  <div class="aw-tile">
    <span v-if="count !== undefined" class="aw-tile-badge">{{ count }}</span>
    <div class="aw-tile-icon" :style="{ background: tint, color: color }">{{ icon }}</div>
    <div class="aw-tile-label">{{ label }}</div>
    <div class="aw-tile-sub">{{ sub }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    sub: string;
    count?: number;
    tint?: string;
    color?: string;
    icon?: string;
  }>(),
  {
    tint: '#DCE7FB',
    color: '#5677FC',
    icon: '▣',
  },
);
</script>
