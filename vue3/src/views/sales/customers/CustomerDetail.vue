<template>
  <div class="aw-detail-page">
    <section class="aw-detail-toolbar">
      <button class="aw-back-btn" type="button" @click="router.push('/sales/customers')"><span class="aw-line-icon line-back" />返回列表</button>
      <div class="aw-detail-actions">
        <button class="aw-tool-btn" type="button">修改</button>
        <button class="aw-tool-btn" type="button">删除</button>
        <button class="aw-tool-btn" type="button">打印</button>
        <button class="aw-tool-btn" type="button">导出</button>
        <button class="aw-tool-btn danger" type="button">停用</button>
      </div>
    </section>
    <section class="aw-detail-header">
      <div class="aw-detail-top">
        <div>
          <div class="aw-detail-title">
            <h2>{{ customer.name }}</h2>
            <span :class="['aw-status', statusTone(customer.status)]">{{ customer.statusName }}</span>
          </div>
          <div class="aw-detail-inline-meta">
            <span class="aw-detail-code">{{ customer.code }}</span>
            <span>客户分组：<strong>{{ customer.groupName }}</strong></span>
            <span>主联系人：<strong>{{ customer.contactName }} / {{ customer.contactPosition }}</strong></span>
            <span>联系方式：<strong>{{ customer.contactPhone }}</strong></span>
            <span>客户经理：<strong>{{ customer.managerName }}</strong></span>
          </div>
        </div>
      </div>
    </section>

    <section class="aw-card">
      <div class="aw-detail-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['aw-detail-tab', { on: activeTab === tab.key }]"
          type="button"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <div class="aw-detail-grid">
          <div v-for="item in detailFields" :key="item.label" class="aw-detail-field">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div class="aw-detail-metrics">
          <div v-for="item in metricFields" :key="item.label" class="aw-detail-metric">
            <span>{{ item.label }}</span>
            <strong>{{ formatMoney(item.value) }}</strong>
          </div>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listCustomers } from '@/app/api/sales/resources';
import type { Customer } from '@/app/api/sales/types';

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
const tabs = [
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
const detailFields = computed(() => [
  { label: '客户名称', value: customer.value.name },
  { label: '客户分组', value: customer.value.groupName },
  { label: '主联系人', value: customer.value.contactName },
  { label: '职位', value: customer.value.contactPosition || '-' },
  { label: '联系方式', value: customer.value.contactPhone },
  { label: '客户经理', value: customer.value.managerName },
  { label: '地址', value: customer.value.address || '-' },
  { label: '客户状态', value: customer.value.statusName },
  { label: '账期', value: customer.value.paymentTerm },
  { label: '信用状态', value: customer.value.creditStatusName },
]);
const metricFields = computed(() => [
  { label: '信用额度', value: customer.value.creditLimit },
  { label: '已用额度', value: customer.value.creditUsed },
  { label: '占用额度', value: customer.value.creditHold },
  { label: '应收未收', value: customer.value.receivableAmount },
  { label: '可用额度', value: customer.value.creditAvailable },
]);

function formatMoney(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
