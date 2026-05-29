<script setup lang="ts">
defineProps<{
  addText?: string;
  backText?: string;
  editorMode?: boolean;
  showAdd?: boolean;
}>();

defineEmits<{
  (event: 'add'): void;
  (event: 'back'): void;
  (event: 'cancel'): void;
  (event: 'edit'): void;
  (event: 'refresh'): void;
  (event: 'save'): void;
}>();
</script>

<template>
  <section class="aw-detail-toolbar">
    <button class="aw-back-btn" type="button" @click="$emit('back')">
      <span class="aw-line-icon line-back" />{{ backText || '返回客户列表' }}
    </button>

    <div v-if="editorMode" class="aw-detail-actions">
      <button class="aw-tool-btn" type="button" @click="$emit('cancel')">取消</button>
      <button class="aw-tool-btn" type="button" @click="$emit('edit')">编辑</button>
      <button class="aw-btn primary" type="button" @click="$emit('save')">保存</button>
    </div>

    <div v-else class="aw-detail-actions">
      <button class="aw-tool-btn" type="button" @click="$emit('refresh')">刷新</button>
      <button v-if="showAdd" class="aw-btn primary" type="button" @click="$emit('add')">{{ addText }}</button>
    </div>
  </section>
</template>
