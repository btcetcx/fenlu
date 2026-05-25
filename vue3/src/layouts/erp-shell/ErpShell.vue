<template>
  <div data-screen-label="ERP Console">
    <erp-topbar :items="topNavItems" :active-key="center.key" />
    <div class="aw-shell">
      <erp-sidebar :title="center.title" :items="center.sideItems" :active-key="side.key" />
      <main class="aw-main">
        <erp-page-head :title="side.label">
          <button v-if="side.key === 'workbench'" class="aw-workbench-board-btn" type="button">
            <span>▧</span>
            <span>大屏看板</span>
          </button>
        </erp-page-head>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ErpPageHead from './ErpPageHead.vue';
import ErpSidebar from './ErpSidebar.vue';
import ErpTopbar from './ErpTopbar.vue';
import { getCenterByPath, getSideByPath, topNavItems } from './navigation';

const route = useRoute();
const center = computed(() => getCenterByPath(route.path));
const side = computed(() => getSideByPath(route.path, center.value));
</script>
