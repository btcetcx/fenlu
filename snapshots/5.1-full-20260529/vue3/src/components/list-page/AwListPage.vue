<template>
  <div :class="['aw-list-layout', { 'aw-list-layout-no-tree': !hasTree }]">
    <slot v-if="hasTree" name="tree" />
    <section class="aw-list-panel">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

const slots = useSlots();
const hasTree = computed(() => Boolean(slots.tree));
</script>
