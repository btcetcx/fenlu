<template>
  <div class="aw-topbar">
    <div class="brand">海南傲为智慧</div>
    <div class="tabs">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ on: item.key === activeKey }"
        @click="router.push(item.route)"
      >
        <span class="tab-ic">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </div>
    <div class="right">
      <button class="ic aw-top-help" type="button" title="帮助中心">?</button>
      <button class="aw-top-notice" type="button" title="我的待办事项">
        <span class="bell">◖</span>
        <span class="aw-top-notice-badge">4</span>
      </button>
      <div class="av">夏</div>
      <span>老夏 ▾</span>
    </div>
  </div>
  <button class="aw-float-help" type="button" title="帮助中心">?</button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { TopNavItem } from './navigation';

defineProps<{
  items: TopNavItem[];
  activeKey: string;
}>();

const router = useRouter();
</script>
