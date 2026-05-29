<template>
  <div class="aw-console-root" data-screen-label="ERP Console">
    <erp-topbar :items="topNavItems" :active-key="center.key" />
    <div class="aw-shell">
      <erp-sidebar :title="center.title" :items="center.sideItems" :active-key="side.key" />
      <main class="aw-main">
        <erp-page-head :title="pageTitle">
          <span v-if="isRdSubstituteList" class="rd-unfinished-badge">未完成</span>
          <button v-if="side.key === 'workbench'" class="aw-workbench-board-btn" type="button">
            <span>▧</span>
            <span>大屏看板</span>
          </button>
        </erp-page-head>
        <div class="aw-page-body">
          <router-view />
        </div>
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
const afterSalesSettingTitles = ['售后原因', '投诉问题', '售后类型', '处理方式'];
const pageTitle = computed(() => {
  if (route.path === '/rd/crafts' && route.query.action === 'new') return '新增工艺';
  const afterSalesAction = String(route.query.action || route.query.setting || '');
  if (route.path === '/after-sales/services' && afterSalesSettingTitles.includes(afterSalesAction)) return afterSalesAction;
  return side.value.label;
});
const isRdSubstituteList = computed(() => route.path === '/rd/bom' && route.query.tab === 'substitute');
</script>

<style scoped>
.rd-unfinished-badge {
  color: var(--aw-danger);
  font-size: 13px;
  font-weight: 700;
}
</style>
