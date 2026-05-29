<template>
  <aw-detail-page v-if="currentView === 'detail' && activeItem">
    <template #toolbar>
      <aw-detail-toolbar back-text="返回质量闭环列表" @back="goList">
        <template #actions>
          <div class="aw-detail-actions">
            <button class="aw-tool-btn" type="button" @click="openService(activeItem.serviceId)">查看售后单</button>
          </div>
        </template>
      </aw-detail-toolbar>
    </template>
    <template #header>
      <aw-detail-header
        :title="activeItem.topic"
        :code="activeItem.code"
        :status-text="activeItem.status"
        :status-tone="activeItem.status === '已关闭' ? 'green' : 'blue'"
        :metas="headerMetas"
      />
    </template>

    <aw-detail-tabs v-model="activeDetailTab" :tabs="detailTabs" />

    <section v-if="activeDetailTab === 'problem'" class="aw-form-card">
      <div class="aw-detail-section-title">问题描述</div>
      <aw-detail-info-grid :items="problemItems" />
    </section>

    <section v-else-if="activeDetailTab === 'eightD'" class="aw-form-card">
      <div class="aw-detail-section-title">8D报告</div>
      <aw-editable-sub-table :columns="eightDColumns" :rows="eightDRows" add-text="添加8D" :show-add="false">
        <template #cell="{ column, row }"><span>{{ row[column.key] }}</span></template>
      </aw-editable-sub-table>
    </section>

    <section v-else-if="activeDetailTab === 'capa'" class="aw-form-card">
      <div class="aw-detail-section-title">CAPA措施</div>
      <aw-editable-sub-table :columns="capaColumns" :rows="capaRows" add-text="添加CAPA" :show-add="false">
        <template #cell="{ column, row }"><span>{{ row[column.key] }}</span></template>
      </aw-editable-sub-table>
    </section>

    <section v-else-if="activeDetailTab === 'verify'" class="aw-form-card">
      <div class="aw-detail-section-title">验证关闭</div>
      <aw-detail-info-grid :items="verifyItems" />
      <div class="as-quality-logs verify">
        <div v-for="row in verificationRows" :key="row" class="as-quality-log">{{ row }}</div>
      </div>
    </section>

    <section v-else-if="activeDetailTab === 'service'" class="aw-form-card">
      <div class="aw-detail-section-title">关联售后单</div>
      <aw-detail-info-grid :items="serviceItems" />
      <button class="aw-tool-btn" type="button" @click="openService(activeItem.serviceId)">查看售后详情</button>
    </section>

    <section v-else class="aw-form-card">
      <div class="aw-detail-section-title">操作记录</div>
      <div class="as-quality-logs">
        <div v-for="row in operationRows" :key="row" class="as-quality-log">{{ row }}</div>
      </div>
    </section>
  </aw-detail-page>

  <section v-else-if="currentView === 'detail'" class="aw-form-card as-quality-missing">
    <div class="aw-detail-section-title">质量闭环不存在</div>
    <p>未找到当前质量闭环单。</p>
    <button class="aw-btn primary" type="button" @click="goList">返回质量闭环列表</button>
  </section>

  <after-sales-rule-setting-page v-else-if="currentView === 'setting'" scope-title="质量改进" back-path="/after-sales/quality" />

  <aw-list-page v-else>
    <template #tree>
      <aw-resource-tree v-model="activeStage" title="质量闭环" :total="items.length" :nodes="treeNodes" />
    </template>
    <aw-list-toolbar
      search-placeholder="搜索质量主题/售后单/客户"
      create-label="新增质量改进"
      @search="keyword = $event"
      @refresh="loadData"
      @filter="noop"
      @columns="noop"
      @import="noop"
      @export="noop"
      @create="noop"
    />
    <div v-if="listMessage" class="as-quality-message">{{ listMessage }}</div>
    <aw-data-table :columns="qualityColumns" :rows="tableRows" row-key="id" :total="filteredItems.length" :filter-values="columnFilters" @column-filter="handleColumnFilter">
      <template #cell="{ column, record, value }">
        <span v-if="column.key === 'topic'" class="aw-link" @click="openQuality(String(record.id))">{{ value }}</span>
        <span v-else-if="column.key === 'status'" :class="['aw-status', value === '已关闭' ? 'green' : 'blue']">{{ value }}</span>
        <span v-else-if="column.key === 'action'">
          <span class="aw-link" @click="openQuality(String(record.id))">查看</span>
          <span class="aw-action-split">|</span>
          <span class="aw-link" @click="openService(String(record.serviceId))">售后单</span>
        </span>
        <span v-else>{{ value ?? '-' }}</span>
      </template>
    </aw-data-table>
  </aw-list-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAfterSalesQualityAction, getAfterSalesService, listAfterSalesQualityActions } from '@/app/api/after-sales/resources';
import type { AfterSalesQualityAction, AfterSalesService } from '@/app/api/after-sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwDataTable from '@/components/list-page/AwDataTable.vue';
import AwListPage from '@/components/list-page/AwListPage.vue';
import AwListToolbar from '@/components/list-page/AwListToolbar.vue';
import AwResourceTree from '@/components/list-page/AwResourceTree.vue';
import AfterSalesRuleSettingPage from './AfterSalesRuleSettingPage.vue';
import { qualityColumns } from './afterSalesList.config';

const router = useRouter();
const route = useRoute();
const items = ref<AfterSalesQualityAction[]>([]);
const activeItem = ref<AfterSalesQualityAction>();
const activeService = ref<AfterSalesService>();
const keyword = ref('');
const activeStage = ref('all');
const activeDetailTab = ref('problem');
const columnFilters = ref<Record<string, string>>({});
const listMessage = ref('');
const stages = ['全部质量闭环', 'D1组建团队', 'D4根因分析', 'CAPA执行', '效果验证', '已关闭'];
const actionStageMap: Record<string, string> = {
  质量改进列表: 'all',
  问题追踪: 'CAPA执行',
  改善验证: '效果验证',
};
const detailTabs = [
  { key: 'problem', label: '问题描述' },
  { key: 'eightD', label: '8D报告' },
  { key: 'capa', label: 'CAPA措施' },
  { key: 'verify', label: '验证关闭' },
  { key: 'service', label: '关联售后单' },
  { key: 'logs', label: '操作记录' },
];
const currentView = computed(() => route.query.setting ? 'setting' : route.query.id ? 'detail' : 'list');
const treeNodes = computed(() => stages.map((label) => ({
  key: label === '全部质量闭环' ? 'all' : label,
  label,
  icon: 'line-doc',
  level: 2 as const,
  count: label === '全部质量闭环' ? items.value.length : items.value.filter((item) => item.stage === label || item.status === label).length,
})));
const filteredItems = computed(() => {
  const term = keyword.value.trim();
  return items.value.filter((item) => {
    const stageMatched = activeStage.value === 'all' || item.stage === activeStage.value || item.status === activeStage.value;
    const filterMatched = !columnFilters.value.stage || item.stage === columnFilters.value.stage;
    const keywordMatched = !term || [item.topic, item.code, item.serviceCode, item.customerName].some((value) => safeText(value).includes(term));
    return stageMatched && filterMatched && keywordMatched;
  });
});
const tableRows = computed<Record<string, unknown>[]>(() => filteredItems.value.map((item) => ({ ...item, action: '查看' })));
const headerMetas = computed(() => activeItem.value ? [
  { label: '来源售后单', value: activeItem.value.serviceCode },
  { label: '客户', value: activeItem.value.customerName },
  { label: '当前阶段', value: activeItem.value.stage },
  { label: '负责人', value: activeItem.value.ownerName },
] : []);
const problemItems = computed(() => activeItem.value ? [
  { label: '问题类型', value: activeItem.value.problemType },
  { label: '问题描述', value: activeItem.value.description },
  { label: '8D编号', value: activeItem.value.eightDCode },
  { label: 'CAPA编号', value: activeItem.value.capaCode },
] : []);
const verifyItems = computed(() => activeItem.value ? [
  { label: '当前状态', value: activeItem.value.status },
  { label: '验证结论', value: activeItem.value.status === '已关闭' ? '已验证关闭' : '等待效果验证' },
  { label: '关闭策略', value: '质量闭环不阻塞售后结单，售后关闭后继续质量追踪。' },
] : []);
const serviceItems = computed(() => activeService.value ? [
  { label: '售后主题', value: activeService.value.topic },
  { label: '售后状态', value: activeService.value.statusName },
  { label: '处理方式', value: activeService.value.handlingMethod },
  { label: '质量联动', value: activeService.value.qualityStatus },
] : []);
const eightDColumns = [
  { key: 'stage', title: '阶段', width: 130 },
  { key: 'content', title: '内容', width: 320 },
  { key: 'owner', title: '负责人', width: 120 },
];
const capaColumns = [
  { key: 'measure', title: '措施', width: 260 },
  { key: 'dueAt', title: '计划完成', width: 130 },
  { key: 'status', title: '状态', width: 120 },
];
const eightDRows = computed(() => activeItem.value?.eightDReports || []);
const capaRows = computed(() => activeItem.value?.capaMeasures || []);
const verificationRows = computed(() => activeItem.value?.verificationLogs || ['暂无验证记录']);
const operationRows = computed(() => activeItem.value?.operationLogs || []);

async function loadData() {
  const result = await listAfterSalesQualityActions({ pageNo: 1, pageSize: 100 });
  items.value = result.items;
}

async function loadDetail(id: string) {
  activeItem.value = await getAfterSalesQualityAction(id);
  activeService.value = activeItem.value ? await getAfterSalesService(activeItem.value.serviceId) : undefined;
}

function openQuality(id: string) {
  router.push({ path: '/after-sales/quality', query: { id } });
}

function openService(id: string) {
  router.push({ path: '/after-sales/services', query: { id } });
}

function goList() {
  router.push('/after-sales/quality');
  activeDetailTab.value = 'problem';
  loadData();
}

function handleColumnFilter(columnKey: string, value: string) {
  columnFilters.value = { ...columnFilters.value, [columnKey]: value };
}

function safeText(value: unknown) {
  return value == null ? '' : String(value);
}

function noop() {}

onMounted(loadData);

watch(
  () => [route.query.stage, route.query.action],
  ([stage, action]) => {
    activeStage.value = String(stage || actionStageMap[String(action || '')] || 'all');
    listMessage.value = String(action || '') === '新增质量改进' || String(action || '') === 'new'
      ? '质量改进建议从售后详情升级生成，以保留来源售后单和回写链路。'
      : '';
  },
  { immediate: true },
);

watch(
  () => route.query.id,
  (id) => {
    if (id) loadDetail(String(id));
  },
  { immediate: true },
);
</script>

<style scoped>
.as-quality-logs {
  display: grid;
  gap: 8px;
}

.as-quality-logs.verify {
  margin-top: 12px;
}

.as-quality-log {
  padding: 10px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
}

.as-quality-missing {
  margin: 12px;
}

.as-quality-message {
  margin: 10px 12px 0;
  padding: 9px 12px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #f7fbff;
  color: var(--aw-text);
}
</style>
