<template>
  <workbench-board :center-title="centerTitle" :data="workbenchData" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import WorkbenchBoard from '@/components/workbench/WorkbenchBoard.vue';
import { workbenchByCenter } from '@/components/workbench/salesWorkbench';
import { getCenterByPath } from '@/layouts/erp-shell/navigation';

const route = useRoute();
const center = computed(() => getCenterByPath(route.path));
const centerKeyMap: Record<string, keyof typeof workbenchByCenter> = {
  rd: 'rd',
  sale: 'sales',
  pur: 'purchase',
  wh: 'warehouse',
  mfg: 'production',
};
const workbenchData = computed(() => workbenchByCenter[centerKeyMap[center.value.key] || 'sales']);
const centerTitle = computed(() => center.value.title);
</script>
