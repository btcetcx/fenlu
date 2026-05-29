<template>
  <purchase-setting-page v-if="purchaseSettingModule" :module="purchaseSettingModule" />
  <operation-setting-page v-else-if="operationSettingModule" :module="operationSettingModule" />
  <page-shell v-else :title="matched?.resource.title || '契约页面'" :description="matched?.resource.description">
    <template #actions>
      <a-button type="primary" :disabled="matched?.resource.status === '预留'">新增</a-button>
    </template>

    <a-alert
      v-if="matched?.resource.status === '预留'"
      type="info"
      show-icon
      message="该模块在接口契约中为预留范围，先保留路由和资源入口，不做页面细化。"
    />

    <a-descriptions bordered size="small" :column="2">
      <a-descriptions-item label="所属中心">{{ matched?.center.title }}</a-descriptions-item>
      <a-descriptions-item label="契约状态">{{ matched?.resource.status }}</a-descriptions-item>
      <a-descriptions-item label="资源路径">{{ matched?.resource.apiPath }}</a-descriptions-item>
      <a-descriptions-item label="原型参考">{{ matched?.resource.prototype }}</a-descriptions-item>
    </a-descriptions>

    <filter-bar />
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="[]"
      :pagination="false"
      :locale="{ emptyText: '等待按页面契约迁移字段与 mock 数据' }"
    />
  </page-shell>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { TableColumnsType } from 'ant-design-vue';
import PageShell from '@/components/page-shell/PageShell.vue';
import FilterBar from '@/components/filter-bar/FilterBar.vue';
import { findContractResource } from '@/app/contracts/modules';
import PurchaseSettingPage from '@/views/purchase/shared/PurchaseSettingPage.vue';
import OperationSettingPage from '@/views/operation/shared/OperationSettingPage.vue';
import type { PurchaseSettingModule } from '@/app/templates/purchase-settings-template';
import type { OperationSettingModule } from '@/app/templates/operation-settings-template';

const route = useRoute();
const matched = computed(() => findContractResource(route.path));
const purchaseSettingModule = computed<PurchaseSettingModule | null>(() => {
  if (!route.query.setting) return null;
  if (route.path === '/purchase/suppliers') return 'suppliers';
  if (route.path === '/purchase/purchase-requests') return 'requests';
  if (route.path === '/purchase/purchase-inquiries') return 'inquiries';
  if (route.path === '/purchase/purchase-orders') return 'orders';
  return null;
});

const operationSettingModule = computed<OperationSettingModule | null>(() => {
  if (!route.query.setting) return null;
  const rdMap: Record<string, OperationSettingModule> = {
    '/rd/doc': 'rdDocs',
    '/rd/projects': 'rdProjects',
    '/rd/products': 'rdProducts',
    '/rd/materials': 'rdMaterials',
    '/rd/processes': 'rdProcesses',
    '/rd/crafts': 'rdCrafts',
    '/rd/bom': 'rdBoms',
  };
  const warehouseMap: Record<string, OperationSettingModule> = {
    '/warehouse/inventory-stocks': 'warehouseStocks',
    '/warehouse/warehouse-inbounds': 'warehouseInbounds',
    '/warehouse/warehouse-outbounds': 'warehouseOutbounds',
    '/warehouse/warehouse-transfers': 'warehouseTransfers',
    '/warehouse/inventory-counts': 'inventoryCounts',
    '/warehouse/warehouse-locations': 'warehouseLocations',
  };
  const productionMap: Record<string, OperationSettingModule> = {
    '/production/production-demands': 'productionDemands',
    '/production/production-plans': 'productionPlans',
    '/production/production-orders': 'productionOrders',
    '/production/production-work-orders': 'productionWorkOrders',
    '/production/outsource-orders': 'outsourceOrders',
  };
  return rdMap[route.path] || warehouseMap[route.path] || productionMap[route.path] || null;
});

const columns: TableColumnsType = [
  { title: '业务编号', dataIndex: 'code', key: 'code' },
  { title: '名称/主题', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'statusName', key: 'statusName' },
  { title: '负责人', dataIndex: 'ownerName', key: 'ownerName' },
];
</script>
