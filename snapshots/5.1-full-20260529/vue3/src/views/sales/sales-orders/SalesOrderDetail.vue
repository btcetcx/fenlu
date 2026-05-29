<template>
  <aw-detail-page>
    <template #toolbar>
      <aw-detail-toolbar :actions="detailActions" @back="emit('back')" @action="handleAction">
        <template #actions>
          <div class="aw-detail-actions">
            <button class="aw-tool-btn" type="button" :disabled="deliveryActionDisabled">{{ deliveryActionText }}</button>
            <button class="aw-tool-btn" type="button">修改</button>
            <button class="aw-tool-btn" type="button">打印</button>
            <button class="aw-tool-btn" type="button">导出</button>
          </div>
        </template>
      </aw-detail-toolbar>
    </template>
    <template #header>
      <aw-detail-header
        :title="`${order.topic} ${order.code}`"
        :status-text="order.statusName"
        :status-tone="statusTone(order.status)"
        :code="order.code"
        :metas="headerMetas"
      />
    </template>

    <section class="aw-card">
      <aw-detail-tabs v-model="activeTab" :tabs="tabs" />

      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <aw-detail-info-grid :items="detailFields" />
        <div class="aw-detail-section-title">附件</div>
        <div class="aw-attach-grid">
          <div v-for="index in 3" :key="index" class="aw-attach-card">
            <strong>新建文本文档.PDF</strong>
            <span>文件大小：0 Bytes</span>
            <span>上传日期：2024-08-1 17:45:27</span>
            <div><span class="aw-link">查看</span><span class="aw-link">下载</span></div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'lines'">
        <div class="aw-detail-section-title">订单明细</div>
        <record-table :columns="lineColumns" :rows="lineRows" />
      </template>

      <template v-else-if="activeTab === 'delivery'">
        <div class="aw-detail-section-title">发货生成应收</div>
        <record-table :columns="deliveryColumns" :rows="recordRows(order.deliveryReceivables)" />
      </template>

      <template v-else-if="activeTab === 'invoice'">
        <div class="aw-detail-section-title">开票申请</div>
        <div class="aw-empty">
          <div>暂无开票申请。到达应开票节点后，系统按规则自动生成开票申请，初始状态为未开票；财务开票完成后回填为已开票。</div>
          <button class="aw-btn primary" type="button">手动开票申请</button>
        </div>
      </template>

      <template v-else-if="activeTab === 'payment'">
        <div class="aw-detail-section-title">回款核销</div>
        <record-table :columns="paymentColumns" :rows="recordRows(order.payments)" />
      </template>

      <template v-else-if="activeTab === 'production'">
        <div class="aw-detail-section-title">生产记录</div>
        <record-table :columns="productionColumns" :rows="recordRows(order.productions)" />
      </template>

      <template v-else-if="activeTab === 'return'">
        <div class="aw-detail-section-title">退换货记录</div>
        <div class="aw-empty">
          <div>暂无退换货记录。可从本订单发起退货或换货，后续记录会按售后单据回填。</div>
          <div><button class="aw-btn primary" type="button">退货</button><button class="aw-btn" type="button">换货</button></div>
        </div>
      </template>

      <template v-else>
        <div class="aw-detail-section-title">操作记录</div>
        <record-table :columns="logColumns" :rows="recordRows(order.operationLogs)" />
      </template>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import type { PropType } from 'vue';
import type { SalesOrder, SalesOrderRecord } from '@/app/api/sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailTabItem } from '@/components/detail-page/types';

const props = defineProps<{ order: SalesOrder }>();
const emit = defineEmits<{ back: [] }>();
const activeTab = ref('info');
const detailActions: DetailAction[] = [];
const tabs: DetailTabItem[] = [
  { key: 'info', label: '订单信息' },
  { key: 'lines', label: '订单明细' },
  { key: 'delivery', label: '发货应收' },
  { key: 'invoice', label: '开票申请' },
  { key: 'payment', label: '回款核销' },
  { key: 'production', label: '生产记录' },
  { key: 'return', label: '退换货记录' },
  { key: 'log', label: '操作记录' },
];
const deliveryColumns = ['序号', '来源明细', '发货单号', '发货仓库/库位', '发货数量', 'OQC状态', '发货金额', '应收确认点', '应收单号', '应收金额', '物流状态', '发货时间'];
const paymentColumns = ['序号', '回款单号', '收款金额', '收款账户', '核销订单', '核销明细', '核销金额', '未核销金额', '信用释放', '核销状态', '收款日期'];
const productionColumns = ['序号', '来源明细', '生产需求号', '生产订单号', '产品名称', '计划生产', '已生产', '待生产', '生产状态'];
const logColumns = ['序号', '操作类型', '操作人', '操作时间', '操作内容'];
const lineColumns = ['序号', '来源明细', '产品编号', '产品名称', '规格型号', '单位', '单价', '销售数量', '合计金额', '已出库数量', '未出库数量', '退货数量', '计划生产数量', '交付日期', '备注'];

const headerMetas = computed(() => [
  { label: '客户', value: props.order.customerName },
  { label: '来源', value: props.order.sourceCode || '手动创建' },
  { label: '下单日期', value: props.order.orderDate },
  { label: '销售人员', value: props.order.ownerName },
  { label: '订单金额', value: formatMoney(props.order.amount) },
  { label: '已回款', value: formatMoney(props.order.receivedAmount) },
  { label: '订单进展', value: props.order.progressName },
]);
const detailFields = computed(() => [
  { label: '订单主题', value: props.order.topic },
  { label: '订单编号', value: props.order.code },
  { label: '订单来源', value: props.order.sourceCode || '手动创建' },
  { label: '合同来源', value: props.order.contractSource || '非必须' },
  { label: '下单日期', value: props.order.orderDate },
  { label: '客户', value: props.order.customerName },
  { label: '订单金额', value: formatMoney(props.order.amount) },
  { label: '销售人员', value: props.order.ownerName },
  { label: '订单状态', value: props.order.statusName },
  { label: '订单进展', value: props.order.progressName },
  { label: '异常标签', value: props.order.exceptionTag || '-' },
  { label: '信用校验', value: props.order.creditCheckName },
  { label: '信用占用', value: props.order.creditHoldName },
  { label: '应收金额', value: formatMoney(props.order.receivableAmount) },
  { label: '开票申请', value: props.order.invoiceRequestName },
  { label: '已回款', value: formatMoney(props.order.receivedAmount) },
  { label: '交付日期', value: props.order.deliveryDate },
  { label: '交货地址', value: props.order.deliveryAddress || '客户默认收货地址 / 可在发货前调整' },
]);
const lineRows = computed(() =>
  (props.order.lines || []).map((row, index) => [
    String(index + 1),
    row.sourceLine || '手动',
    row.productNo,
    row.productName,
    row.model,
    row.unit,
    formatMoney(row.price),
    String(row.quantity),
    formatMoney(row.amount),
    String(row.shippedQuantity ?? 0),
    String(row.unshippedQuantity ?? 0),
    String(row.returnedQuantity ?? 0),
    String(row.planQuantity ?? 0),
    row.deliveryDate || '-',
    row.note || '',
  ]),
);
const deliveryActionText = computed(() => {
  if (props.order.progressName === '已完成') return '已完成';
  if (props.order.progressName === '已发货') return '已自动发货';
  if (props.order.progressName === '部分发货' || props.order.progressName === '发货中') return '部分发货';
  return '发货';
});
const deliveryActionDisabled = computed(() => ['已完成', '已发货'].includes(props.order.progressName));

function recordRows(rows?: SalesOrderRecord[]) {
  return rows?.map((row) => row.values) || [];
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusTone(status: string) {
  if (['passed', 'held', 'requested', 'shipped', 'approved', 'confirmed', 'completed'].includes(status)) return 'green';
  if (['pendingApproval', 'pending', 'waiting', 'nearLimit', 'cashPending', 'shipping', 'production'].includes(status)) return 'yellow';
  return 'gray';
}

function handleAction(_key: string) {
  // Detail actions are displayed to match the prototype; workflows are connected later.
}

const RecordTable = defineComponent({
  props: {
    columns: { type: Array as PropType<string[]>, required: true },
    rows: { type: Array as PropType<string[][]>, required: true },
  },
  setup(componentProps) {
    return () =>
      h('div', { class: 'aw-doc-tbl-wrap' }, [
        h('div', { class: 'aw-doc-tbl-inner' }, [
          h('table', { class: 'aw-doc-tbl' }, [
            h('thead', [h('tr', componentProps.columns.map((column) => h('th', [h('div', { class: 'aw-th-inner' }, column)])))]),
            h(
              'tbody',
              componentProps.rows.length
                ? componentProps.rows.map((row) => h('tr', row.map((cell) => h('td', cell))))
                : [h('tr', [h('td', { colspan: componentProps.columns.length, class: 'aw-empty-cell' }, '暂无记录')])],
            ),
          ]),
        ]),
      ]);
  },
});
</script>

<style scoped>
.aw-attach-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.aw-attach-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-3);
  font-size: 12px;
}
.aw-empty {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 34px 12px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-3);
  text-align: center;
}
.aw-empty-cell {
  padding: 24px 12px;
  color: var(--aw-fg-3);
  text-align: center;
}
</style>
