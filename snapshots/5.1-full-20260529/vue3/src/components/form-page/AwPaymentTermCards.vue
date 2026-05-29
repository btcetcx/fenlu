<template>
  <div class="aw-payment-grid">
    <div
      v-for="item in items"
      :key="item.key"
      :class="['aw-payment-card', { on: modelValue === item.key }]"
      @click="selectItem(item.key)"
    >
      <span :class="['aw-payment-radio', { checked: modelValue === item.key }]" />
      <strong>{{ item.label }}</strong>
      <input
        class="aw-input aw-payment-input"
        :value="item.value"
        :placeholder="item.placeholder"
        @click.stop
        @input="emit('update:item', item.key, ($event.target as HTMLInputElement).value)"
      />
      <div v-if="item.tip" class="aw-field-hint">{{ item.tip }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentTermItem } from './types';

defineProps<{
  modelValue: string;
  items: PaymentTermItem[];
}>();

const emit = defineEmits<{
  'update:modelValue': [key: string];
  change: [key: string];
  'update:item': [key: string, value: string];
}>();

function selectItem(key: string) {
  emit('update:modelValue', key);
  emit('change', key);
}
</script>
