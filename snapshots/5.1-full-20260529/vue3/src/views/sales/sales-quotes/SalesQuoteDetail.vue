<template>
  <aw-detail-page>
    <template #toolbar>
      <aw-detail-toolbar :actions="detailActions" @back="emit('back')" @action="handleAction" />
    </template>
    <template #header>
      <aw-detail-header
        :title="quote.topic"
        :status-text="quote.statusName"
        :status-tone="statusTone(quote.status)"
        :code="quote.code"
        :metas="headerMetas"
      />
    </template>

    <section class="aw-card">
      <aw-detail-tabs v-model="activeTab" :tabs="tabs" />
      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <aw-detail-info-grid :items="detailFields" />
      </template>
      <template v-else-if="activeTab === 'products'">
        <div class="aw-detail-section-title">产品明细</div>
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th class="aw-index-col">序号</th><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>基础单价</th><th>阶梯报价</th></tr></thead>
              <tbody>
                <template v-for="(row, index) in quote.products || []" :key="row.id">
                  <tr>
                    <td>{{ index + 1 }}</td><td class="aw-num">{{ row.productNo }}</td><td>{{ row.productName }}</td><td>{{ row.model }}</td><td>{{ row.unit }}</td><td class="aw-num">{{ money(row.price) }}</td>
                    <td><span :class="['aw-status', row.tier === '启用' ? 'green' : 'gray']">{{ row.tier }}</span><span v-if="row.tier === '启用'" class="aw-link" style="margin-left:10px" @click="toggleTier(row.id)">{{ expanded[row.id] ? '收起' : '展开' }}</span></td>
                  </tr>
                  <tr v-if="expanded[row.id]">
                    <td colspan="7" style="background:var(--aw-surface-2);padding:12px">
                      <table class="aw-table">
                        <thead><tr><th>序号</th><th>数量条件</th><th>优惠百分比</th><th>规则说明</th></tr></thead>
                        <tbody><tr v-for="(tier, tierIndex) in quote.tiers || []" :key="tier.id"><td>{{ tierIndex + 1 }}</td><td>大于等于 {{ tier.minQty }}</td><td>{{ tier.discount }}%</td><td>{{ tier.note }}</td></tr></tbody>
                      </table>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
      <template v-else-if="activeTab === 'trace'">
        <div class="aw-detail-section-title">转化与财务追踪</div>
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th>序号</th><th>转化动作</th><th>目标单据</th><th>客户/项目</th><th>转化金额</th><th>应收状态</th><th>开票状态</th><th>回款状态</th><th>操作时间</th></tr></thead>
              <tbody><tr v-for="row in traceRows" :key="row.index"><td v-for="cell in Object.values(row)" :key="cell">{{ cell }}</td></tr></tbody>
            </table>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="aw-detail-section-title">附件/操作记录</div>
        <div class="aw-attachment-grid">
          <div v-for="file in quote.attachments || []" :key="file.id" class="aw-attachment-file">
            <div class="aw-attachment-name">{{ file.name }}</div>
            <div class="aw-attachment-meta">文件大小：{{ file.size }}</div>
            <div class="aw-attachment-meta">上传日期：{{ file.uploadedAt }}</div>
            <div class="aw-attachment-actions"><a>预览</a><a>下载</a></div>
          </div>
          <div v-if="!(quote.attachments || []).length" class="aw-upload-box">暂无附件</div>
        </div>
      </template>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { listSalesQuotes } from '@/app/api/sales/resources';
import type { SalesQuote } from '@/app/api/sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailTabItem } from '@/components/detail-page/types';

const props = defineProps<{ id: string }>();
const emit = defineEmits<{ back: [] }>();
const quote = ref<SalesQuote>({
  id: '',
  code: '',
  topic: '',
  quoteType: '',
  quoteTypeName: '',
  customerName: '',
  amount: 0,
  currency: 'CNY',
  priceVersion: '',
  conversionStatus: '',
  conversionStatusName: '',
  quoteDate: '',
  expireDate: '',
  ownerName: '',
  status: '',
  statusName: '',
});
const activeTab = ref('info');
const expanded = ref<Record<string, boolean>>({});
const detailActions: DetailAction[] = [
  { key: 'edit', label: '修改' },
  { key: 'submit', label: '提交审批' },
  { key: 'convert', label: '转订单' },
  { key: 'print', label: '打印' },
  { key: 'export', label: '导出' },
];
const tabs: DetailTabItem[] = [
  { key: 'info', label: '基础信息' },
  { key: 'products', label: '产品明细' },
  { key: 'trace', label: '转化与财务追踪' },
  { key: 'attachments', label: '附件/操作记录' },
];
const headerMetas = computed(() => [
  { label: '报价类型', value: quote.value.quoteTypeName },
  { label: '适用客户', value: quote.value.customerName },
  { label: '报价金额', value: money(quote.value.amount) },
  { label: '报价人员', value: quote.value.ownerName },
]);
const detailFields = computed(() => [
  { label: '报价主题', value: quote.value.topic },
  { label: '报价编号', value: quote.value.code },
  { label: '报价分类', value: categoryLabel(quote.value.category) },
  { label: '开始日期', value: quote.value.quoteDate },
  { label: '失效日期', value: quote.value.expireDate },
  { label: '适用客户', value: quote.value.customerName },
  { label: '价格版本', value: quote.value.priceVersion },
  { label: '转化状态', value: quote.value.conversionStatusName },
  { label: quote.value.relationKind || '关联对象', value: quote.value.relationName || '-' },
  { label: '报价详情', value: quote.value.detail || '-' },
]);
const traceRows = computed(() => [
  {
    index: '1',
    action: quote.value.contractCode && quote.value.contractCode !== '-' ? '报价转合同' : '报价转订单',
    target: quote.value.contractCode && quote.value.contractCode !== '-' ? quote.value.contractCode : quote.value.orderCode || '-',
    customer: quote.value.customerName,
    amount: money(quote.value.amount),
    receivable: '待生成应收',
    invoice: '未申请',
    received: '未回款',
    time: `${quote.value.quoteDate} 10:20`,
  },
  ...(quote.value.orderCode && quote.value.orderCode !== '-'
    ? [{
        index: '2',
        action: '下游订单',
        target: quote.value.orderCode,
        customer: quote.value.customerName,
        amount: money(quote.value.amount),
        receivable: '部分应收',
        invoice: '待申请',
        received: '部分回款',
        time: `${quote.value.quoteDate} 15:30`,
      }]
    : []),
]);

function statusTone(status: string) {
  if (status === 'approved') return 'green';
  if (status === 'pendingApproval' || status === 'draft') return 'yellow';
  if (status === 'expired') return 'gray';
  return '';
}

function money(value: number | undefined) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function categoryLabel(category?: string) {
  if (category === 'universal') return '通用';
  if (category === 'promo') return '促销报价';
  if (category === 'once') return '一次性报价';
  return '分组报价';
}

function toggleTier(id: string) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] };
}

function handleAction(_key: string) {
  // Detail actions are visual parity only in this pass.
}

onMounted(async () => {
  const result = await listSalesQuotes({ pageNo: 1, pageSize: 20 });
  quote.value = result.items.find((item) => item.id === props.id) || result.items[0] || quote.value;
});
</script>
