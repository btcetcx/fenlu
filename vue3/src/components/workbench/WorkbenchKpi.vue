<template>
  <div class="aw-kpi" :class="tone">
    <div class="l">{{ label }}</div>
    <div class="n">{{ value }}</div>
    <div class="a">{{ action }}</div>
    <div class="ic">{{ icon }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'peach' | 'mint' | 'sky' | 'rose' | 'lilac' | 'sand';
    label: string;
    value: number | string;
    action?: string;
    icon?: string;
  }>(),
  {
    tone: 'peach',
    action: '点击查看',
    icon: '📄',
  },
);
</script>
