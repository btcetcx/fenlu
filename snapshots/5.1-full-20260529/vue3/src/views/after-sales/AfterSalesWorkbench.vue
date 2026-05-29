<template>
  <workbench-board center-title="售后中心" :data="workbenchData" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getAfterSalesWorkbench } from '@/app/api/after-sales/resources';
import WorkbenchBoard from '@/components/workbench/WorkbenchBoard.vue';

type WorkbenchData = {
  kpis: Array<{ tone: string; label: string; value: number; icon: string }>;
  tiles: Array<{ label: string; sub: string; count: number; tint: string; color: string; icon: string }>;
  entries: Array<{ label: string; tint: string; color: string; icon: string }>;
  notices: Array<{ type: string; text: string; time: string; tone: string }>;
  recent: Array<{ title: string; meta: string }>;
};

const workbenchData = ref<WorkbenchData>({
  kpis: [],
  tiles: [],
  entries: [],
  notices: [],
  recent: [],
});

async function loadData() {
  workbenchData.value = await getAfterSalesWorkbench() as WorkbenchData;
}

onMounted(loadData);
</script>
