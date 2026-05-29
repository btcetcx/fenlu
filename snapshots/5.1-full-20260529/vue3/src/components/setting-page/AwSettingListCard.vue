<script setup lang="ts">
defineProps<{
  description?: string;
  keyword?: string;
  searchPlaceholder?: string;
  title: string;
}>();

const emit = defineEmits<{
  (event: 'update:keyword', value: string): void;
}>();

function updateKeyword(event: Event) {
  emit('update:keyword', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <section class="aw-form-card aw-setting-list-card">
    <div class="aw-setting-head">
      <div>
        <div class="aw-detail-section-title">{{ title }}</div>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="aw-search aw-setting-search">
        <span class="aw-line-icon line-search"></span>
        <input
          :value="keyword"
          :placeholder="searchPlaceholder"
          @input="updateKeyword"
        />
      </div>
    </div>
    <slot />
  </section>
</template>
