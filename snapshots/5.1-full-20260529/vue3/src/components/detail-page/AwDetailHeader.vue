<template>
  <section class="aw-detail-header">
    <div class="aw-detail-top">
      <div>
        <div class="aw-detail-title">
          <h2>{{ title }}</h2>
          <span :class="['aw-status', statusTone]">{{ statusText }}</span>
          <slot name="title-extra" />
        </div>
        <div class="aw-detail-inline-meta">
          <span class="aw-detail-code">{{ code }}</span>
          <span v-for="item in metas" :key="item.label">
            {{ item.label }}：<strong>{{ item.value }}</strong>
          </span>
        </div>
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DetailMetaItem } from './types';

defineProps<{
  title: string;
  statusText: string;
  statusTone?: string;
  code: string;
  metas: DetailMetaItem[];
}>();
</script>
