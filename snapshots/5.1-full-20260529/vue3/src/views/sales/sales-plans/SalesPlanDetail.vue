<template>
  <aw-detail-page>
    <template #toolbar>
      <aw-detail-toolbar :actions="detailActions" @back="emit('back')" @action="handleAction" />
    </template>
    <template #header>
      <aw-detail-header
        :title="plan.name"
        :status-text="plan.statusName"
        :status-tone="statusTone(plan.status)"
        :code="plan.code"
        :metas="headerMetas"
      />
    </template>

    <section class="aw-card">
      <aw-detail-tabs v-model="activeTab" :tabs="tabs" />
      <template v-if="activeTab === 'info'">
        <div class="aw-detail-section-title">基础信息</div>
        <aw-detail-info-grid :items="detailFields" />
        <div class="aw-detail-section-title">计划产品</div>
        <div class="aw-doc-tbl-wrap">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th>产品编号</th><th>产品名称</th><th>目标数量</th><th>目标金额</th><th>完成数量</th><th>完成金额</th><th>达成率</th></tr></thead>
              <tbody>
                <tr v-for="line in productLines" :key="line.productCode">
                  <td class="aw-num">{{ line.productCode }}</td>
                  <td>{{ line.productName }}</td>
                  <td class="aw-num">{{ line.targetQuantity }}</td>
                  <td class="aw-num">{{ money(line.targetAmount) }}</td>
                  <td class="aw-num">{{ plan.doneQuantity }}</td>
                  <td class="aw-num">{{ money(plan.doneAmount) }}</td>
                  <td><span :class="['aw-status', achievementTone(plan.achievementRate)]">{{ plan.achievementRate }}%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="aw-detail-section-title">计划详情</div>
        <div class="aw-rich-preview">
          <p>本计划面向 2026 年重点销售周期，围绕{{ plan.productSummary }}在重点客户、渠道客户和战略客户中的新增订单转化展开。</p>
          <p>目标销售数量 {{ plan.targetQuantity }}，目标销售金额 {{ money(plan.targetAmount) }} 元。执行过程中按订单确认口径统计业绩，并按人员、产品、金额维度查看完成情况。</p>
          <p>若月度达成率低于 70%，系统应触发计划预警，由负责人补充跟进记录并调整客户拜访与报价策略。</p>
        </div>
      </template>

      <template v-else-if="activeTab === 'performance'">
        <div class="aw-detail-section-title">追踪筛选</div>
        <div class="aw-form-grid" style="margin-bottom:14px">
          <div class="aw-field">
            <label>追踪维度</label>
            <select v-model="trackDimension" class="aw-select">
              <option value="amount">按金额</option>
              <option value="person">按人员</option>
              <option value="product">按产品</option>
            </select>
          </div>
          <div class="aw-field"><label>相关人员</label><input class="aw-input" :value="relatedPeople" readonly /></div>
          <div class="aw-field">
            <label>统计口径</label>
            <select class="aw-select"><option>按订单确认</option><option>按发货</option><option>按回款</option></select>
          </div>
        </div>
        <div class="aw-kpi-grid">
          <div class="aw-kpi sky"><div class="l">目标金额</div><div class="n">{{ money(plan.targetAmount) }}</div></div>
          <div class="aw-kpi mint"><div class="l">完成金额</div><div class="n">{{ money(plan.doneAmount) }}</div></div>
          <div class="aw-kpi peach"><div class="l">缺口金额</div><div class="n">{{ money(gapAmount) }}</div></div>
          <div class="aw-kpi rose"><div class="l">达成率</div><div class="n">{{ plan.achievementRate }}%</div></div>
        </div>
        <div class="aw-detail-section-title">执行进度 / {{ dimensionLabel }}</div>
        <table class="aw-table">
          <thead><tr><th>{{ dimensionHead }}</th><th>目标金额</th><th>完成金额</th><th>达成率</th><th>相关人员</th><th>趋势</th></tr></thead>
          <tbody>
            <tr v-for="row in trackRows" :key="row.k">
              <td>{{ row.k }}</td><td>{{ row.target }}</td><td>{{ row.done }}</td><td>{{ row.rate }}</td><td>{{ row.people }}</td><td>{{ row.trend }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-else-if="activeTab === 'sales'">
        <div class="aw-detail-section-title">关联销售业绩</div>
        <table class="aw-table">
          <thead><tr><th>销售订单</th><th>客户</th><th>产品</th><th>销售人员</th><th>数量</th><th>金额</th><th>日期</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="row in salesRows" :key="row.order">
              <td class="aw-link">{{ row.order }}</td><td>{{ row.customer }}</td><td>{{ row.product }}</td><td>{{ row.owner }}</td><td>{{ row.qty }}</td><td>{{ money(row.amount) }}</td><td>{{ row.date }}</td><td>{{ row.status }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-else>
        <div class="aw-detail-section-title">操作记录</div>
        <table class="aw-table">
          <thead><tr><th>时间</th><th>操作人</th><th>操作内容</th><th>备注</th></tr></thead>
          <tbody>
            <tr><td>2026-05-01 09:30</td><td>老大</td><td>创建销售计划</td><td>提交审批</td></tr>
            <tr><td>2026-05-02 10:12</td><td>李文涛</td><td>计划开始执行</td><td>按销售一部目标拆解</td></tr>
          </tbody>
        </table>
      </template>
    </section>
  </aw-detail-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { listSalesPlans } from '@/app/api/sales/resources';
import type { SalesPlan } from '@/app/api/sales/types';
import AwDetailHeader from '@/components/detail-page/AwDetailHeader.vue';
import AwDetailInfoGrid from '@/components/detail-page/AwDetailInfoGrid.vue';
import AwDetailPage from '@/components/detail-page/AwDetailPage.vue';
import AwDetailTabs from '@/components/detail-page/AwDetailTabs.vue';
import AwDetailToolbar from '@/components/detail-page/AwDetailToolbar.vue';
import type { DetailAction, DetailTabItem } from '@/components/detail-page/types';

const props = defineProps<{ id: string }>();
const emit = defineEmits<{ back: [] }>();
const plan = ref<SalesPlan>({
  id: '',
  code: '',
  name: '',
  productSummary: '',
  cycleStart: '',
  cycleEnd: '',
  ownerName: '',
  targetQuantity: 0,
  targetAmount: 0,
  doneQuantity: 0,
  doneAmount: 0,
  achievementRate: 0,
  status: '',
  statusName: '',
});
const activeTab = ref('info');
const trackDimension = ref<'amount' | 'person' | 'product'>('amount');
const detailActions: DetailAction[] = [
  { key: 'edit', label: '修改' },
  { key: 'submit', label: '提交审批' },
  { key: 'pause', label: '暂停' },
  { key: 'close', label: '关闭' },
  { key: 'export', label: '导出' },
];
const tabs: DetailTabItem[] = [
  { key: 'info', label: '计划信息' },
  { key: 'performance', label: '业绩追踪' },
  { key: 'sales', label: '销售明细' },
  { key: 'logs', label: '操作记录' },
];
const salesRows = [
  { order: 'SO-20260517001', customer: '傲为', product: '高精度伺服电机', owner: '李文涛', qty: 18, amount: 108000, date: '2026-05-04', status: '已发货' },
  { order: 'SO-20260517008', customer: '深圳市启明科技有限公司', product: '高精度伺服电机', owner: '李文涛', qty: 25, amount: 150000, date: '2026-05-11', status: '生产中' },
  { order: 'SO-20260517116', customer: '广州明德贸易有限公司', product: '高精度伺服电机', owner: '陈思源', qty: 25, amount: 150000, date: '2026-05-16', status: '已确认' },
];
const tracking = {
  amount: [
    { k: '2026-04', target: '240,000', done: '132,000', rate: '55%', people: '李文涛', trend: '低于计划' },
    { k: '2026-05', target: '240,000', done: '276,000', rate: '115%', people: '李文涛、陈思源', trend: '超额完成' },
    { k: '2026-06', target: '240,000', done: '0', rate: '0%', people: '李文涛', trend: '待执行' },
  ],
  person: [
    { k: '李文涛', target: '420,000', done: '258,000', rate: '61%', people: '李文涛', trend: '需跟进重点客户' },
    { k: '陈思源', target: '180,000', done: '150,000', rate: '83%', people: '陈思源', trend: '接近达成' },
    { k: '赵强', target: '120,000', done: '0', rate: '0%', people: '赵强', trend: '待启动' },
  ],
  product: [
    { k: '高精度伺服电机', target: '720,000', done: '408,000', rate: '57%', people: '李文涛、陈思源', trend: '主计划产品' },
    { k: '配套控制器', target: '180,000', done: '96,000', rate: '53%', people: '赵强', trend: '关联销售不足' },
    { k: '安装服务包', target: '60,000', done: '36,000', rate: '60%', people: '李文涛', trend: '随订单带动' },
  ],
};
const headerMetas = computed(() => [
  { label: '计划周期', value: `${plan.value.cycleStart} ~ ${plan.value.cycleEnd}` },
  { label: '负责对象', value: plan.value.ownerName },
  { label: '目标金额', value: money(plan.value.targetAmount) },
  { label: '达成率', value: `${plan.value.achievementRate}%` },
]);
const detailFields = computed(() => [
  { label: '计划名称', value: plan.value.name },
  { label: '计划编号', value: plan.value.code },
  { label: '计划状态', value: plan.value.statusName },
  { label: '计划产品', value: plan.value.productSummary },
  { label: '计划周期', value: `${plan.value.cycleStart} ~ ${plan.value.cycleEnd}` },
  { label: '负责对象', value: plan.value.ownerName },
  { label: '目标数量', value: String(plan.value.targetQuantity) },
  { label: '目标金额', value: money(plan.value.targetAmount) },
  { label: '统计口径', value: '按订单确认' },
]);
const productLines = computed(() => plan.value.lines || []);
const gapAmount = computed(() => Math.max(plan.value.targetAmount - plan.value.doneAmount, 0));
const relatedPeople = computed(() => Array.from(new Set([plan.value.ownerName.split('/').pop()?.trim(), ...salesRows.map((row) => row.owner)])).filter(Boolean).join('、'));
const dimensionLabel = computed(() => ({ amount: '金额维度', person: '人员维度', product: '产品维度' }[trackDimension.value]));
const dimensionHead = computed(() => (trackDimension.value === 'amount' ? '月份' : trackDimension.value === 'person' ? '销售人员' : '产品'));
const trackRows = computed(() => tracking[trackDimension.value]);

function statusTone(status: string) {
  if (status === 'executing' || status === 'completed') return 'green';
  if (status === 'pendingApproval' || status === 'notStarted') return 'yellow';
  if (status === 'paused' || status === 'closed') return 'gray';
  return '';
}

function achievementTone(rate: number) {
  if (rate >= 100) return 'green';
  if (rate > 0) return 'blue';
  return 'gray';
}

function money(value: number | undefined) {
  return Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function handleAction(_key: string) {
  // Detail actions are visual parity only in this pass.
}

onMounted(async () => {
  const result = await listSalesPlans({ pageNo: 1, pageSize: 20 });
  plan.value = result.items.find((item) => item.id === props.id || item.code === props.id) || result.items[0] || plan.value;
});
</script>

<style scoped>
.aw-rich-preview {
  color: var(--aw-fg-2);
  font-size: 13px;
  line-height: 1.9;
}

.aw-rich-preview p {
  margin: 0 0 8px;
}

.aw-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
</style>
