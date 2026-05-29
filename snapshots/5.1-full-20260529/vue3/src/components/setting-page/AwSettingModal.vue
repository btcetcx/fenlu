<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  width?: string;
}>();

defineEmits<{
  (event: 'cancel'): void;
  (event: 'confirm'): void;
}>();
</script>

<template>
  <div v-if="open" class="aw-modal-mask">
    <div class="aw-modal" :style="{ width: width || undefined }">
      <div class="aw-modal-head">
        <strong>{{ title }}</strong>
        <button class="aw-modal-close" type="button" @click="$emit('cancel')">x</button>
      </div>
      <div class="aw-modal-body">
        <slot />
      </div>
      <div class="aw-modal-foot">
        <slot name="footer">
          <button class="aw-tool-btn" type="button" @click="$emit('cancel')">取消</button>
          <button class="aw-btn primary" type="button" @click="$emit('confirm')">确定</button>
        </slot>
      </div>
    </div>
  </div>
</template>
