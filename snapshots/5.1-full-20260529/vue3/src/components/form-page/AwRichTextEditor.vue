<template>
  <div class="aw-rt-bar">
    <span v-for="item in menuItems" :key="item">{{ item }}</span>
  </div>
  <div class="aw-rt-bar aw-rt-tools">
    <span>B</span><span><i>I</i></span><span><u>U</u></span><span>S</span>
    <i></i>
    <span>左对齐</span><span>居中</span><span>•</span><span>1.</span><span>链接</span><span>图片</span><span>表格</span>
  </div>
  <div class="aw-rt-area" contenteditable="true" @input="handleInput">{{ modelValue || placeholder }}</div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    menuItems?: string[];
  }>(),
  {
    modelValue: '',
    placeholder: '请输入客户背景、合作偏好、风险说明等信息',
    menuItems: () => ['文件', '编辑', '插入', '视图', '格式', '表格'],
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLElement).innerText);
}
</script>
