<template>
  <div class="aw-form-page">
    <slot name="toolbar">
      <section class="aw-detail-toolbar">
        <button class="aw-back-btn" type="button" @click="emit('back')">
          <span class="aw-line-icon line-back" />{{ backText }}
        </button>
        <div class="aw-detail-actions">
          <button
            v-for="action in actions"
            :key="action.key"
            :class="action.primary ? 'aw-btn primary' : 'aw-tool-btn'"
            type="button"
            @click="emit('action', action.key)"
          >
            {{ action.label }}
          </button>
        </div>
      </section>
    </slot>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { FormAction } from './types';

withDefaults(
  defineProps<{
    backText?: string;
    actions?: FormAction[];
  }>(),
  {
    backText: '返回列表',
    actions: () => [],
  },
);

const emit = defineEmits<{
  back: [];
  action: [key: string];
}>();
</script>
