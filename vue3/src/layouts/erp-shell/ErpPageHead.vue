<template>
  <div class="aw-page-head">
    <span class="aw-page-title">{{ title }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
