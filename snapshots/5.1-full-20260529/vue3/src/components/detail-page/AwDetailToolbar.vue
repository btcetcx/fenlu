<template>
  <section class="aw-detail-toolbar">
    <button class="aw-back-btn" type="button" @click="emit('back')">
      <span class="aw-line-icon line-back" />{{ backText }}
    </button>
    <slot name="actions">
      <div class="aw-detail-actions">
        <button
          v-for="action in actions"
          :key="action.key"
          :class="['aw-tool-btn', { danger: action.danger }]"
          type="button"
          @click="emit('action', action.key)"
        >
          {{ action.label }}
        </button>
      </div>
    </slot>
  </section>
</template>

<script setup lang="ts">
import type { DetailAction } from './types';

withDefaults(
  defineProps<{
    backText?: string;
    actions?: DetailAction[];
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
