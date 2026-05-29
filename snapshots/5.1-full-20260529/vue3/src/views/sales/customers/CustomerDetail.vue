<template>
  <aw-detail-page>
    <template #toolbar>
      <aw-detail-toolbar :actions="detailActions" @back="router.push('/sales/customers')" @action="handleAction" />
    </template>
    <template #header>
      <aw-detail-header
        :title="customer.name"
        :status-text="customer.statusName"
        :status-tone="statusTone(customer.status)"
        :code="customer.code"
        :metas="headerMetas"
      />
    </template>

    <section class="aw-card">
      <aw-detail-tabs v-model="activeTab" :tabs="tabs" />

      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <aw-detail-info-grid :items="detailFields" />
        <aw-detail-metric-grid :items="metricFields" :formatter="formatMoney" />
      </template>

      <template v-else>
        <div class="aw-detail-section-title">{{ activeTabLabel }}</div>
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th class="aw-index-col"><div class="aw-th-inner">序号</div></th><th>单据编号</th><th>业务类型</th><th>金额</th><th>状态</th><th>业务日期</th></tr></thead>
              <tbody><tr><td>1</td><td class="aw-link">SO-202605-031</td><td>销售订单</td><td class="aw-num">288,000.00</td><td><span class="aw-status green">已确认</span></td><td>2026-05-31</td></tr></tbody>
            </table>
          </div>
        </div>
      </template>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listCustomers } from '@/app/api/sales/resources';
import type { Customer } from '@/app/api/sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailMetricGrid from '@/components/detail-page/AwDetailMetricGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailTabItem } from '@/components/detail-page/types';

const router = useRouter();
const route = useRoute();
const customer = ref<Customer>({
  id: '',
  code: '',
  name: '',
  groupName: '',
  contactName: '',
  contactPosition: '',
  contactPhone: '',
  managerName: '',
  creditLimit: 0,
  creditUsed: 0,
  creditHold: 0,
  receivableAmount: 0,
  creditAvailable: 0,
  paymentTerm: '',
  creditStatus: '',
  creditStatusName: '',
  status: '',
  statusName: '',
});
const activeTab = ref('info');
const detailActions: DetailAction[] = [
  { key: 'edit', label: '修改' },
  { key: 'delete', label: '删除' },
  { key: 'print', label: '打印' },
  { key: 'export', label: '导出' },
  { key: 'disable', label: '停用', danger: true },
];
const tabs: DetailTabItem[] = [
  { key: 'info', label: '客户信息' },
  { key: 'product', label: '产品记录' },
  { key: 'buy', label: '购买记录' },
  { key: 'outbound', label: '发货记录' },
  { key: 'invoice', label: '开票记录' },
  { key: 'pay', label: '回款核销' },
  { key: 'after', label: '售后记录' },
  { key: 'log', label: '操作记录' },
];

const activeTabLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || '');
const headerMetas = computed(() => [
  { label: '客户分组', value: customer.value.groupName },
  { label: '主联系人', value: `${customer.value.contactName} / ${customer.value.contactPosition || '-'}` },
  { label: '联系方式', value: customer.value.contactPhone },
  { label: '客户经理', value: customer.value.managerName },
]);
const detailFields = computed(() => [
  { label: '客户名称', value: customer.value.name },
  { label: '客户分组', value: customer.value.groupName },
  { label: '主联系人', value: customer.value.contactName },
  { label: '职位', value: customer.value.contactPosition || '-' },
  { label: '联系方式', value: customer.value.contactPhone },
  { label: '客户经理', value: customer.value.managerName },
  { label: '地址', value: customer.value.address || '-' },
  { label: '客户状态', value: customer.value.statusName },
]);
const metricFields = computed(() => [
  { label: '信用额度', value: customer.value.creditLimit },
  { label: '已用额度', value: customer.value.creditUsed },
  { label: '占用额度', value: customer.value.creditHold },
  { label: '应收未收', value: customer.value.receivableAmount },
  { label: '可用额度', value: customer.value.creditAvailable },
]);

function formatMoney(value: string | number) {
  if (typeof value === 'number') {
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value;
}

function handleAction(_key: string) {
  // Action handlers will be connected when detail workflows are accepted.
}

function statusTone(status: string) {
  if (status === 'approved') return 'green';
  if (status === 'pending') return 'yellow';
  if (status === 'disabled') return 'gray';
  return '';
}

onMounted(async () => {
  const result = await listCustomers({ pageNo: 1, pageSize: 20 });
  customer.value = result.items.find((item) => item.id === route.params.id) || result.items[0] || customer.value;
});
</script>
