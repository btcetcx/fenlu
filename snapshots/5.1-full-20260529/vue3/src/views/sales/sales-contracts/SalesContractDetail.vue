<template>
  <aw-detail-page>
    <template #toolbar>
      <aw-detail-toolbar :actions="detailActions" @back="router.push('/sales/sales-contracts')" @action="handleDetailAction" />
    </template>
    <template #header>
      <aw-detail-header
        :title="contract.topic"
        :code="contract.code"
        :status-text="contract.executionStatusName"
        :status-tone="statusTone(contract.executionStatus)"
        :metas="headerMetas"
      />
    </template>

    <section class="aw-form-card">
      <aw-detail-tabs v-model="activeTab" :tabs="tabs" />
      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <aw-detail-info-grid :items="infoItems" />
      </template>
      <template v-else-if="activeTab === 'products'">
        <div class="aw-detail-section-title">合同产品</div>
        <record-table :columns="productColumns" :rows="productRows" />
      </template>
      <template v-else-if="activeTab === 'orders'">
        <div class="aw-detail-section-title">订单核销</div>
        <record-table :columns="orderColumns" :rows="orderRows" />
      </template>
      <template v-else-if="activeTab === 'deliveries'">
        <div class="aw-detail-section-title">发货记录</div>
        <record-table :columns="deliveryColumns" :rows="deliveryRows" />
      </template>
      <template v-else-if="activeTab === 'invoices'">
        <div class="aw-detail-section-title">开票记录</div>
        <record-table :columns="invoiceColumns" :rows="invoiceRows" />
      </template>
      <template v-else-if="activeTab === 'payments'">
        <div class="aw-detail-section-title">回款记录</div>
        <record-table :columns="paymentColumns" :rows="paymentRows" />
      </template>
      <template v-else>
        <div class="aw-detail-section-title">操作记录</div>
        <record-table :columns="operationColumns" :rows="operationRows" />
      </template>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref, type PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSalesContract } from '@/app/api/sales/resources';
import type { SalesContract } from '@/app/api/sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailFieldItem, DetailMetaItem, DetailTabItem } from '@/components/detail-page/types';

const route = useRoute();
const router = useRouter();
const activeTab = ref('info');
const contract = ref<SalesContract>({
  id: '',
  code: '',
  topic: '',
  customerName: '',
  amount: 0,
  currency: 'CNY',
  signedDate: '',
  effectiveDate: '',
  expireDate: '',
  receivedAmount: 0,
  invoiceAmount: 0,
  executionStatusName: '',
  status: '',
  statusName: '',
  ownerName: '',
});

const detailActions: DetailAction[] = [
  { key: 'edit', label: '编辑' },
  { key: 'submit', label: '提交审批' },
  { key: 'terminate', label: '终止', danger: true },
];
const tabs: DetailTabItem[] = [
  { key: 'info', label: '合同信息' },
  { key: 'products', label: '合同产品' },
  { key: 'orders', label: '订单核销' },
  { key: 'deliveries', label: '发货记录' },
  { key: 'invoices', label: '开票记录' },
  { key: 'payments', label: '回款记录' },
  { key: 'operations', label: '操作记录' },
];

const headerMetas = computed<DetailMetaItem[]>(() => [
  { label: '客户', value: contract.value.customerName },
  { label: '来源', value: contract.value.sourceCode || '-' },
  { label: '签订日期', value: contract.value.signedDate },
  { label: '销售人员', value: contract.value.ownerName },
]);
const infoItems = computed<DetailFieldItem[]>(() => [
  { label: '合同主题', value: contract.value.topic },
  { label: '合同编号', value: contract.value.code },
  { label: '客户', value: contract.value.customerName },
  { label: '来源单据', value: contract.value.sourceCode || '-' },
  { label: '合同金额', value: money(contract.value.amount) },
  { label: '已下单金额', value: money(contract.value.orderedAmount) },
  { label: '已发货金额', value: money(contract.value.shippedAmount) },
  { label: '应收金额', value: money(contract.value.receivableAmount) },
  { label: '已开票金额', value: money(contract.value.invoiceAmount) },
  { label: '已回款金额', value: money(contract.value.receivedAmount) },
  { label: '剩余金额', value: money(contract.value.balanceAmount) },
  { label: '签订日期', value: contract.value.signedDate },
  { label: '失效日期', value: contract.value.expireDate },
  { label: '销售人员', value: contract.value.ownerName },
  { label: '履约状态', value: contract.value.executionStatusName },
]);

const productColumns = ['来源明细', '产品编号', '产品名称', '单位', '合同数量', '已下单', '剩余可下单', '单价', '金额', '支付约定'];
const productRows = computed(() =>
  (contract.value.products || []).map((item) => [
    item.sourceLine,
    item.productCode,
    item.productName,
    item.unit,
    item.quantity,
    item.orderedQuantity ?? 0,
    item.balanceQuantity ?? 0,
    money(item.unitPrice),
    money(item.amount),
    item.paymentTerm || '-',
  ]),
);
const orderColumns = ['销售订单', '订单明细', '核销数量', '核销金额', '核销时间', '状态'];
const orderRows = computed(() => (contract.value.orderWriteOffs || []).map((item) => [item.orderCode, item.orderLine, item.quantity, money(Number(item.amount)), item.time, item.status]));
const deliveryColumns = ['发货单', '销售订单', '发货数量', '出库金额', '物流状态', '时间'];
const deliveryRows = computed(() => (contract.value.deliveryRecords || []).map((item) => [item.deliveryCode, item.orderCode, item.quantity, money(Number(item.amount)), item.logisticsStatus, item.time]));
const invoiceColumns = ['发票申请', '发票号', '开票金额', '税额', '状态'];
const invoiceRows = computed(() => (contract.value.invoiceRecords || []).map((item) => [item.requestCode, item.invoiceCode, money(Number(item.amount)), money(Number(item.taxAmount)), item.status]));
const paymentColumns = ['收款单', '回款金额', '核销订单', '核销状态', '时间'];
const paymentRows = computed(() => (contract.value.paymentRecords || []).map((item) => [item.receiptCode, money(Number(item.amount)), item.orderCode, item.writeOffStatus, item.time]));
const operationColumns = ['时间', '操作人', '操作', '说明'];
const operationRows = computed(() => (contract.value.operationRecords || []).map((item) => [item.time, item.operator, item.action, item.remark]));

const RecordTable = defineComponent({
  props: {
    columns: { type: Array as PropType<string[]>, required: true },
    rows: { type: Array as PropType<Array<Array<string | number>>>, required: true },
  },
  setup(props) {
    return () =>
      h('div', { class: 'aw-doc-tbl-wrap' }, [
        h('div', { class: 'aw-doc-tbl-inner' }, [
          h('table', { class: 'aw-doc-tbl' }, [
            h('thead', [h('tr', [h('th', { style: 'width:60px' }, '序号'), ...props.columns.map((column) => h('th', column))])]),
            h(
              'tbody',
              props.rows.length
                ? props.rows.map((row, index) => h('tr', [h('td', index + 1), ...row.map((cell) => h('td', String(cell ?? '-')))]))
                : [h('tr', [h('td', { colspan: props.columns.length + 1, style: 'text-align:center;color:var(--aw-fg-3);padding:24px' }, '暂无记录')])],
            ),
          ]),
        ]),
      ]);
  },
});

function statusTone(status: unknown) {
  if (status === 'performing' || status === 'completed') return 'green';
  if (status === 'pendingExecution' || status === 'pendingApproval') return 'yellow';
  if (status === 'disabled' || status === 'terminated') return 'gray';
  return '';
}

function money(value?: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function handleDetailAction(_key: string) {
  // 编辑、审批和终止流程等待后端接口与审批流接入。
}

onMounted(async () => {
  const id = String(route.query.contractId || route.query.id || 'contract_001');
  contract.value = await getSalesContract(id);
});
</script>
