<template>
  <section class="page-shell">
    <div class="page-shell__head">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <a-space>
        <slot name="actions" />
      </a-space>
    </div>
    <div class="page-shell__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
