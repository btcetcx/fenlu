<template>
  <aw-form-page :actions="formActions" @back="emit('back')" @action="handleFormAction">
    <section class="aw-form-card">
      <div class="aw-detail-section-title">基础信息</div>
      <div class="aw-form-grid">
        <div class="aw-field"><label class="req">报价主题</label><input class="aw-input" placeholder="请输入内容" /></div>
        <div class="aw-field"><label>报价编号</label><input class="aw-input" value="自动" disabled /></div>
        <div class="aw-field">
          <label class="req">报价分类</label>
          <select v-model="quoteCategory" class="aw-select" @change="handleCategoryChange">
            <option value="">请选择</option>
            <option>通用</option>
            <option>分组报价</option>
            <option>促销报价</option>
            <option>指定客户报价</option>
            <option>一次性报价</option>
          </select>
        </div>
        <div class="aw-field"><label class="req">开始日期</label><input class="aw-input" placeholder="请选择" /></div>
        <div class="aw-field"><label class="req">失效日期</label><input class="aw-input" placeholder="请选择" /></div>
        <div class="aw-field">
          <label class="req">适用范围</label>
          <div class="aw-field-row">
            <input class="aw-input" :value="scopeText" readonly placeholder="选择报价分类后自动带出适用范围" @click="openScopePicker" />
            <button class="aw-tool-btn" type="button" @click="openScopePicker">选择</button>
          </div>
        </div>
        <div class="aw-field"><label>价格版本</label><input class="aw-input" value="V1 / 保存后锁定历史版本" readonly /></div>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">产品明细</div>
      <aw-editable-sub-table :columns="productColumns" :rows="products" add-text="新增明细" :action-width="140" @add="showProductPicker = true">
        <template #cell="{ column, row }">
          <input v-if="column.key === 'productNo'" v-model="row.productNo" class="aw-input" />
          <input v-else-if="column.key === 'productName'" v-model="row.productName" class="aw-input" />
          <input v-else-if="column.key === 'model'" v-model="row.model" class="aw-input" />
          <input v-else-if="column.key === 'unit'" v-model="row.unit" class="aw-input" />
          <input v-else-if="column.key === 'price'" v-model="row.price" class="aw-input" placeholder="填写产品单价" />
        </template>
        <template #actions="{ row }">
          <span class="aw-link" @click="openTierProduct(row)">阶梯报价</span>
          <span class="aw-link" style="color:var(--aw-danger);margin-left:10px" @click="removeProduct(row.id)">删除</span>
        </template>
      </aw-editable-sub-table>
      <div class="aw-form-summary">
        <span>产品明细：<strong>{{ products.length }}</strong> 项</span>
        <span>阶梯报价：<strong>{{ tierEnabledCount }}</strong> 项</span>
        <span>报价金额合计：<strong>{{ quoteAmountTotal }}</strong></span>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">报价详情</div>
      <aw-rich-text-editor v-model="detail" placeholder="请输入报价说明、适用条件、客户沟通记录等信息" />
      <div v-if="submitMessage" class="aw-form-note">{{ submitMessage }}</div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">附件</div>
      <div class="aw-attachment-grid">
        <div class="aw-attachment-file">
          <div class="aw-attachment-name">新建文本文档.PDF</div>
          <div class="aw-attachment-meta">文件大小：0 Bytes</div>
          <div class="aw-attachment-meta">上传日期：2024-08-01 17:46:27</div>
          <div class="aw-attachment-actions"><a>重新上传</a><a>删除</a></div>
        </div>
        <div class="aw-attachment-upload">
          <div class="aw-attachment-upload-icon">+</div>
          <p><a>点击上传</a> / 拖拽到此区域</p>
        </div>
      </div>
    </section>

    <div v-if="showProductPicker" class="aw-mask" @click="showProductPicker = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><strong>选择产品</strong><button class="aw-modal-close" type="button" @click="showProductPicker = false">×</button></div>
        <div class="body">
          <table class="aw-table">
            <thead><tr><th>选择</th><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>单价</th></tr></thead>
            <tbody>
              <tr v-for="row in productPickerRows" :key="row.productNo" @click="togglePickedProduct(row)">
                <td><label class="aw-check"><input type="checkbox" :checked="pickedProducts.some((item) => item.productNo === row.productNo)" /><span /></label></td>
                <td class="aw-num">{{ row.productNo }}</td><td>{{ row.productName }}</td><td>{{ row.model }}</td><td>{{ row.unit }}</td><td class="aw-num">{{ row.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="aw-modal-foot"><button class="aw-tool-btn" type="button" @click="showProductPicker = false">取消</button><button class="aw-btn primary" type="button" @click="confirmProducts">确定</button></div>
      </div>
    </div>

    <div v-if="tierProduct" class="aw-mask" @click="tierProduct = null">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><strong>设置产品阶梯报价</strong><button class="aw-modal-close" type="button" @click="tierProduct = null">×</button></div>
        <div class="body">
          <div class="aw-form-grid" style="margin-bottom:14px">
            <div>产品编号：{{ tierProduct.productNo }}</div>
            <div>产品名称：{{ tierProduct.productName }}</div>
            <div>基础单价：{{ tierProduct.price || '-' }}</div>
          </div>
          <table class="aw-table">
            <thead><tr><th>序号</th><th>起订数量（大于等于）</th><th>优惠百分比</th><th>规则说明</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="(row, index) in tiers" :key="row.id">
                <td>{{ index + 1 }}</td>
                <td><input v-model="row.minQty" class="aw-input" placeholder="如 100" /></td>
                <td><input v-model="row.discount" class="aw-input" placeholder="如 5%" /></td>
                <td><input v-model="row.note" class="aw-input" placeholder="自动或手动填写规则说明" /></td>
                <td><span class="aw-link" style="color:var(--aw-danger)" @click="removeTier(row.id)">删除</span></td>
              </tr>
            </tbody>
          </table>
          <button class="aw-tool-btn" type="button" style="margin-top:10px" @click="addTier">+ 新增阶梯</button>
        </div>
        <div class="aw-modal-foot"><button class="aw-tool-btn" type="button" @click="tierProduct = null">取消</button><button class="aw-btn primary" type="button" @click="confirmTier">确定</button></div>
      </div>
    </div>

    <div v-if="showGroupPicker" class="aw-mask" @click="showGroupPicker = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><strong>选择客户分组</strong><button class="aw-modal-close" type="button" @click="showGroupPicker = false">×</button></div>
        <div class="body">
          <table class="aw-table">
            <thead><tr><th>选择</th><th>客户分组</th><th>客户数量</th><th>负责人</th><th>说明</th></tr></thead>
            <tbody>
              <tr v-for="group in groups" :key="group.name" @click="selectedGroup = group">
                <td><label class="aw-check"><input type="checkbox" :checked="selectedGroup.name === group.name" /><span /></label></td>
                <td>{{ group.name }}</td><td>{{ group.count }}</td><td>{{ group.manager }}</td><td>{{ group.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="aw-modal-foot"><button class="aw-tool-btn" type="button" @click="showGroupPicker = false">取消</button><button class="aw-btn primary" type="button" @click="confirmGroup">确定</button></div>
      </div>
    </div>

    <div v-if="showTargetPicker" class="aw-mask" @click="showTargetPicker = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><strong>选择报价适用对象</strong><button class="aw-modal-close" type="button" @click="showTargetPicker = false">×</button></div>
        <div class="body">
          <div class="aw-detail-tabs">
            <button :class="['aw-detail-tab', { on: targetTab === 'customer' }]" type="button" @click="switchTargetTab('customer')">选择客户</button>
            <button :class="['aw-detail-tab', { on: targetTab === 'project' }]" type="button" @click="switchTargetTab('project')">选择项目</button>
          </div>
          <div class="aw-search" style="width:320px;margin:12px 0"><input :placeholder="targetTab === 'customer' ? '搜索客户名称/编号' : '搜索项目名称/编号'" /></div>
          <table class="aw-table">
            <thead><tr><th>选择</th><th>编号</th><th>名称</th><th>{{ targetTab === 'customer' ? '客户分组' : '关联客户' }}</th><th>负责人</th></tr></thead>
            <tbody>
              <tr v-for="row in targetRows" :key="row.code" :style="{ opacity: row.disabled ? 0.55 : 1, cursor: row.disabled ? 'not-allowed' : 'pointer' }" @click="!row.disabled && (selectedTarget = row)">
                <td><label class="aw-check"><input type="checkbox" :checked="selectedTarget?.code === row.code" /><span /></label></td>
                <td class="aw-num">{{ row.code }}</td><td>{{ row.name }} <span v-if="row.disabled" class="aw-status gray">已停用</span></td><td>{{ row.group || row.customer }}</td><td>{{ row.manager }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="aw-modal-foot"><button class="aw-tool-btn" type="button" @click="showTargetPicker = false">取消</button><button class="aw-btn primary" type="button" :disabled="!selectedTarget" @click="confirmTarget">确定</button></div>
      </div>
    </div>
  </aw-form-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { createSalesQuote } from '@/app/api/sales/resources';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { EditableColumn, FormAction } from '@/components/form-page/types';

type ProductRow = { id: string; productNo: string; productName: string; model: string; unit: string; price: string; tier?: string };
type GroupRow = { name: string; count: number; manager: string; note: string };
type TargetRow = { code: string; name: string; group?: string; customer?: string; manager: string; disabled?: boolean };

const emit = defineEmits<{ back: [] }>();
const quoteCategory = ref('');
const scopeText = ref('');
const detail = ref('');
const showProductPicker = ref(false);
const showGroupPicker = ref(false);
const showTargetPicker = ref(false);
const tierProduct = ref<ProductRow | null>(null);
const targetTab = ref<'customer' | 'project'>('customer');
const selectedTarget = ref<TargetRow | null>(null);
const products = ref<ProductRow[]>([]);
const pickedProducts = ref<ProductRow[]>([]);
const submitMessage = ref('');
const submitting = ref(false);
const tiers = ref([
  { id: 'qt1', minQty: '100', discount: '3', note: '大于等于 100 KG，优惠 3%' },
  { id: 'qt2', minQty: '300', discount: '5', note: '大于等于 300 KG，优惠 5%' },
  { id: 'qt3', minQty: '500', discount: '8', note: '大于等于 500 KG，优惠 8%' },
]);
const groups: GroupRow[] = [
  { name: '重点客户', count: 26, manager: '老大', note: '重点维护客户，优先使用专属报价' },
  { name: '战略客户', count: 12, manager: '李文涛', note: '年度合作客户，支持阶梯折扣' },
  { name: '普通客户', count: 68, manager: '陈思源', note: '默认销售客户分组' },
  { name: '渠道客户', count: 18, manager: '赵强', note: '经销商、代理商渠道报价' },
];
const selectedGroup = ref<GroupRow>(groups[0]);
const customers: TargetRow[] = [
  { code: 'CUS-2026-001', name: '海南星海智能制造有限公司', group: '重点客户', manager: '老大' },
  { code: 'CUS-2026-002', name: '深圳市启明科技有限公司', group: '战略客户', manager: '李文涛' },
  { code: 'CUS-2026-003', name: '广州南方装备有限公司', group: '普通客户', manager: '陈思源' },
  { code: 'CUS-2026-004', name: '东莞华美包装制品厂', group: '渠道客户', manager: '赵强', disabled: true },
];
const projects: TargetRow[] = [
  { code: 'PRJ-2026-017', name: '智能输送线项目', customer: '海南星海智能制造有限公司', manager: '老大' },
  { code: 'PRJ-2026-021', name: '包装自动化改造', customer: '东莞华美包装制品厂', manager: '赵强', disabled: true },
  { code: 'PRJ-2026-028', name: '电子装配测试线', customer: '深圳市启明科技有限公司', manager: '李文涛' },
];
const productPickerRows: ProductRow[] = [
  { id: 'p1', productNo: '7820864', productName: '半成品物料', model: 'HM-450', unit: 'KG', price: '50.00' },
  { id: 'p2', productNo: '5786931', productName: '半成品物料', model: 'HM-451', unit: 'KG', price: '48.00' },
  { id: 'p3', productNo: '8518691', productName: '铝合金型材', model: 'AL-6061', unit: 'KG', price: '32.00' },
];
const formActions: FormAction[] = [
  { key: 'draft', label: '保存草稿' },
  { key: 'reset', label: '重置' },
  { key: 'save', label: '保存报价', primary: true },
];
const productColumns: EditableColumn[] = [
  { key: 'productNo', title: '产品编号', width: 120 },
  { key: 'productName', title: '产品名称', width: 150 },
  { key: 'model', title: '规格型号', width: 130 },
  { key: 'unit', title: '单位', width: 80 },
  { key: 'price', title: '单价', width: 110 },
];
const targetRows = computed(() => (targetTab.value === 'customer' ? customers : projects));
const quoteAmountTotal = computed(() => money(products.value.reduce((sum, row) => sum + Number(row.price || 0), 0)));
const tierEnabledCount = computed(() => products.value.filter((row) => row.tier !== '未设置').length);

function handleCategoryChange() {
  scopeText.value = quoteCategory.value === '通用' ? '全量客户通用报价' : '';
  selectedTarget.value = null;
  if (quoteCategory.value === '分组报价') showGroupPicker.value = true;
  if (quoteCategory.value === '指定客户报价' || quoteCategory.value === '一次性报价') showTargetPicker.value = true;
}

function openScopePicker() {
  if (quoteCategory.value === '分组报价') showGroupPicker.value = true;
  if (quoteCategory.value === '指定客户报价' || quoteCategory.value === '一次性报价') showTargetPicker.value = true;
}

function togglePickedProduct(row: ProductRow) {
  pickedProducts.value = pickedProducts.value.some((item) => item.productNo === row.productNo)
    ? pickedProducts.value.filter((item) => item.productNo !== row.productNo)
    : [...pickedProducts.value, row];
}

function confirmProducts() {
  products.value.push(...pickedProducts.value.map((row) => ({ ...row, id: `quote-${Date.now()}-${row.productNo}`, tier: '未设置' })));
  pickedProducts.value = [];
  showProductPicker.value = false;
}

function switchTargetTab(tab: 'customer' | 'project') {
  targetTab.value = tab;
  selectedTarget.value = null;
}

function removeProduct(id: string) {
  products.value = products.value.filter((row) => row.id !== id);
}

function openTierProduct(row: Record<string, any>) {
  tierProduct.value = row as ProductRow;
}

function addTier() {
  tiers.value.push({ id: `tier-${Date.now()}`, minQty: '', discount: '', note: '' });
}

function removeTier(id: string) {
  tiers.value = tiers.value.filter((row) => row.id !== id);
}

function confirmTier() {
  if (tierProduct.value) tierProduct.value.tier = '启用';
  tierProduct.value = null;
}

function confirmGroup() {
  scopeText.value = `客户分组：${selectedGroup.value.name}`;
  showGroupPicker.value = false;
}

function confirmTarget() {
  if (!selectedTarget.value) return;
  scopeText.value = `${targetTab.value === 'customer' ? '客户' : '项目'}：${selectedTarget.value.name}`;
  showTargetPicker.value = false;
}

async function handleFormAction(key: string) {
  if (key === 'reset') {
    quoteCategory.value = '';
    scopeText.value = '';
    products.value = [];
    detail.value = '';
    submitMessage.value = '已重置。';
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  await createSalesQuote({
    topic: '新增报价',
    code: '自动生成',
    quoteTypeName: quoteCategory.value || '未选择',
    customerName: scopeText.value || '通用',
    amount: products.value.reduce((sum, row) => sum + Number(row.price || 0), 0),
    priceVersion: 'V1',
    status: key === 'draft' ? 'draft' : 'pendingApproval',
    statusName: key === 'draft' ? '草稿' : '审核中',
    category: quoteCategory.value,
    relationName: scopeText.value,
    detail: detail.value,
    products: products.value.map((row) => ({
      ...row,
      price: Number(row.price || 0),
      tier: row.tier || '',
    })),
    tiers: tiers.value.map((row) => ({
      ...row,
      minQty: Number(row.minQty || 0),
      discount: Number(row.discount || 0),
    })),
  });
  submitMessage.value = key === 'draft' ? '草稿已通过新增接口保存。' : '报价已通过新增接口保存。';
  submitting.value = false;
}

function money(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.aw-form-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: var(--aw-surface-2);
  color: var(--aw-fg-3);
  font-size: 13px;
}

.aw-form-summary strong {
  color: var(--aw-fg);
}
</style>
