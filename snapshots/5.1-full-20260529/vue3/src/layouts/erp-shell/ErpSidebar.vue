<template>
  <aside class="aw-side">
    <h4>{{ title }}</h4>
    <div
      v-for="item in items"
      :key="item.key"
      class="item"
      :class="{ on: item.key === activeKey }"
      @click="router.push(item.route)"
      @mouseenter="openFlyout(item, $event)"
      @mouseleave="scheduleClose"
    >
      <span class="dot">○</span>
      <span>{{ item.label }}</span>
    </div>

    <div
      v-if="hoverItem?.flyout"
      class="aw-flyout"
      :style="{ top: `${flyoutTop}px` }"
      @mouseenter="cancelClose"
      @mouseleave="scheduleClose"
    >
      <div v-for="section in hoverItem.flyout" :key="section.title" class="aw-flyout-sec">
        <div class="aw-flyout-h">{{ section.title }}</div>
        <div class="aw-flyout-items">
          <a v-for="entry in section.items" :key="entry.label" @click="openFlyoutEntry(entry)">{{ entry.label }}</a>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FlyoutEntry, SideNavItem } from './navigation';

defineProps<{
  title: string;
  items: SideNavItem[];
  activeKey: string;
}>();

const router = useRouter();
const hoverItem = ref<SideNavItem>();
const flyoutTop = ref(80);
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function openFlyout(item: SideNavItem, event: MouseEvent) {
  clearTimeout(closeTimer);
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  hoverItem.value = item.flyout ? item : undefined;
  flyoutTop.value = Math.max(52, rect.top + rect.height / 2 - 110);
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    hoverItem.value = undefined;
  }, 150);
}

function cancelClose() {
  clearTimeout(closeTimer);
}

function openFlyoutEntry(entry: FlyoutEntry) {
  if (!entry.route) return;
  router.push(entry.route);
  hoverItem.value = undefined;
}
</script>
