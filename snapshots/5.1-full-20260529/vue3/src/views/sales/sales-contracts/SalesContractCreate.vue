<template>
  <aw-form-page :actions="formActions" @back="router.push('/sales/sales-contracts')" @action="handleFormAction">
    <section class="aw-form-card">
      <div class="aw-detail-section-title">基础信息</div>
      <div class="aw-form-grid">
        <div class="aw-field"><label class="req">合同主题</label><input class="aw-input" placeholder="填写合同主题" /></div>
        <div class="aw-field"><label>合同编号</label><input class="aw-input" value="自动生成" disabled /></div>
        <div class="aw-field">
          <label class="req">关联客户</label>
          <div class="aw-field-row">
            <input class="aw-input" :value="customer.name" readonly placeholder="点击选择客户" @click="openCustomerPicker" />
            <button class="aw-tool-btn" type="button" @click="openCustomerPicker">选择</button>
          </div>
        </div>
        <div class="aw-field">
          <label>适用报价</label>
          <select v-model="source" class="aw-select" :disabled="!customer.name">
            <option value="">{{ customer.name ? '不选择报价（手动/项目来源合同）' : '请先选择关联客户' }}</option>
            <option v-for="option in quoteOptions" :key="option">{{ option }}</option>
          </select>
          <span class="aw-field-hint">只有报价来源合同时必须选择适用报价。</span>
        </div>
        <div class="aw-field"><label>客户联系人</label><input class="aw-input" :value="customer.contact" readonly placeholder="选择客户后自动带出" /></div>
        <div class="aw-field"><label>联系电话</label><input class="aw-input" :value="customer.phone" readonly placeholder="选择客户后自动带出" /></div>
        <div class="aw-field"><label class="req">签订日期</label><input class="aw-input" placeholder="选择签订日期" /></div>
        <div class="aw-field"><label class="req">失效日期</label><input class="aw-input" placeholder="选择失效日期" /></div>
        <div class="aw-field"><label>履约状态</label><input class="aw-input" value="待审批" readonly /></div>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">合同产品</div>
      <aw-editable-sub-table :columns="productColumns" :rows="productRows" add-text="新增明细" :action-width="90" @add="productPickerOpen = true">
        <template #cell="{ column, row }">
          <span v-if="['sourceLine', 'productCode', 'productName', 'model', 'unit'].includes(column.key)">{{ row[column.key] }}</span>
          <input v-else-if="column.key === 'quantity'" v-model="row.quantity" class="aw-input" />
          <input v-else-if="column.key === 'unitPrice'" v-model="row.unitPrice" class="aw-input" />
          <input v-else-if="column.key === 'deliveryTerm'" v-model="row.deliveryTerm" class="aw-input" placeholder="填写交付批次/日期" />
          <select v-else-if="column.key === 'paymentTerm'" v-model="row.paymentTerm" class="aw-select">
            <option value="">请选择</option>
            <option>签约后预付</option>
            <option>按订单节点付款</option>
            <option>发货后付款</option>
            <option>验收后付款</option>
            <option>月结付款</option>
          </select>
        </template>
        <template #actions="{ row }">
          <span class="aw-link" style="color:var(--aw-danger)" @click="removeProduct(String(row.id))">删除</span>
        </template>
      </aw-editable-sub-table>
      <div class="aw-contract-total">
        <span>合同总金额：<strong>{{ money(contractTotal) }}</strong></span>
        <label>优惠金额：<input v-model="discountAmount" class="aw-input" placeholder="填写优惠金额" /></label>
        <span>优惠后金额：<strong>{{ money(finalTotal) }}</strong></span>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">合同详情</div>
      <aw-rich-text-editor v-model="detailText" placeholder="填写合同条款、交付约束、价格有效规则、违约责任和特殊约定" />
      <div v-if="submitMessage" class="aw-form-note">{{ submitMessage }}</div>
    </section>

    <div v-if="customerPickerOpen" class="aw-mask" @click="customerPickerOpen = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><span class="aw-modal-title">选择客户</span><button class="aw-modal-close" type="button" @click="customerPickerOpen = false">×</button></div>
        <div class="body">
          <div class="aw-search" style="width:320px;margin-bottom:12px"><input placeholder="搜索客户名称/编号/联系人" /></div>
          <table class="aw-table">
            <thead><tr><th style="width:60px">选择</th><th>客户编号</th><th>客户名称</th><th>客户分组</th><th>联系人</th><th>联系电话</th><th>客户经理</th></tr></thead>
            <tbody>
              <tr
                v-for="item in customers"
                :key="item.code"
                :style="{ opacity: item.disabled ? 0.55 : 1, cursor: item.disabled ? 'not-allowed' : 'pointer', background: selectedCustomer?.code === item.code ? 'var(--aw-primary-weak)' : '' }"
                @click="selectCustomer(item)"
              >
                <td><label class="aw-check"><input type="radio" :checked="selectedCustomer?.code === item.code" :disabled="item.disabled" /><span /></label></td>
                <td class="aw-num">{{ item.code }}</td>
                <td><span class="aw-link">{{ item.name }}</span><span v-if="item.disabled" class="aw-status gray" style="margin-left:8px">已停用</span></td>
                <td>{{ item.group }}</td>
                <td>{{ item.contact }}</td>
                <td class="aw-num">{{ item.phone }}</td>
                <td>{{ item.manager }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="aw-modal-foot">
          <button class="aw-tool-btn" type="button" @click="customerPickerOpen = false">取消</button>
          <button class="aw-btn primary" type="button" :disabled="!selectedCustomer || selectedCustomer.disabled" @click="confirmCustomer">确定</button>
        </div>
      </div>
    </div>

    <div v-if="productPickerOpen" class="aw-mask" @click="productPickerOpen = false">
      <div class="aw-modal lg" @click.stop>
        <div class="head"><span class="aw-modal-title">选择产品</span><button class="aw-modal-close" type="button" @click="productPickerOpen = false">×</button></div>
        <div class="body">
          <table class="aw-table">
            <thead><tr><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>单价</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="item in products" :key="item.productCode">
                <td class="aw-num">{{ item.productCode }}</td><td>{{ item.productName }}</td><td>{{ item.model }}</td><td>{{ item.unit }}</td><td class="aw-num">{{ money(item.unitPrice) }}</td>
                <td><span class="aw-link" @click="addProduct(item)">选择</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="aw-modal-foot"><button class="aw-tool-btn" type="button" @click="productPickerOpen = false">取消</button></div>
      </div>
    </div>
  </aw-form-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import { createSalesContract } from '@/app/api/sales/resources';
import type { EditableColumn, FormAction } from '@/components/form-page/types';

interface PickerCustomer {
  code: string;
  name: string;
  group: string;
  contact: string;
  phone: string;
  manager: string;
  disabled?: boolean;
}

interface ProductRow {
  id: string;
  sourceLine: string;
  productCode: string;
  productName: string;
  model: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  deliveryTerm: string;
  paymentTerm: string;
}

const router = useRouter();
const source = ref('');
const customerPickerOpen = ref(false);
const productPickerOpen = ref(false);
const discountAmount = ref('');
const detailText = ref('');
const submitMessage = ref('');
const submitting = ref(false);
const customer = reactive({ code: '', name: '', contact: '', phone: '' });
const selectedCustomer = ref<PickerCustomer | null>(null);
const productRows = ref<ProductRow[]>([]);

const formActions: FormAction[] = [
  { key: 'draft', label: '保存草稿' },
  { key: 'reset', label: '重置' },
  { key: 'submit', label: '提交审批', primary: true },
];
const quoteOptions = ['一次性报价单 SP-20251221004', '指定报价单 SP-20251221001', '分组报价单 SP-20251221002', '促销报价单 SP-20251221003', '通用报价单 SP-20251221005'];
const customers: PickerCustomer[] = [
  { code: 'CUS-2026-001', name: '深圳市启明科技有限公司', group: '战略客户', contact: '何志远', phone: '13900139002', manager: '李文涛' },
  { code: 'CUS-2026-002', name: '海南星海智能制造有限公司', group: '重点客户', contact: '林悦', phone: '13800138001', manager: '老夏' },
  { code: 'CUS-2026-003', name: '广州南方装备有限公司', group: '普通客户', contact: '苏婉清', phone: '13700137003', manager: '陈思源' },
  { code: 'CUS-2026-004', name: '东莞华美包装制品厂', group: '渠道客户', contact: '赵一鸣', phone: '13600136004', manager: '赵强', disabled: true },
];
const products = [
  { productCode: '7820864', productName: '半成品物料', model: 'HM-450', unit: 'KG', unitPrice: 50 },
  { productCode: '5786931', productName: '半成品模组', model: 'HM-451', unit: 'KG', unitPrice: 48 },
  { productCode: '8518691', productName: '铝合金型材', model: 'AL-6061', unit: 'KG', unitPrice: 32 },
];
const productColumns: EditableColumn[] = [
  { key: 'sourceLine', title: '来源明细', width: 150 },
  { key: 'productCode', title: '产品编号', width: 110 },
  { key: 'productName', title: '产品名称', width: 140 },
  { key: 'model', title: '规格型号', width: 110 },
  { key: 'unit', title: '单位', width: 80 },
  { key: 'quantity', title: '合同数量', width: 110 },
  { key: 'unitPrice', title: '单价', width: 100 },
  { key: 'deliveryTerm', title: '交付约定', width: 180 },
  { key: 'paymentTerm', title: '支付约定', width: 150 },
];

const contractTotal = computed(() => productRows.value.reduce((sum, row) => sum + toNumber(row.quantity) * toNumber(row.unitPrice), 0));
const finalTotal = computed(() => Math.max(contractTotal.value - toNumber(discountAmount.value), 0));

function openCustomerPicker() {
  selectedCustomer.value = customers.find((item) => item.code === customer.code) ?? customers.find((item) => !item.disabled) ?? null;
  customerPickerOpen.value = true;
}

function selectCustomer(item: PickerCustomer) {
  if (item.disabled) return;
  selectedCustomer.value = item;
}

function confirmCustomer() {
  const item = selectedCustomer.value;
  if (!item || item.disabled) return;
  customer.code = item.code;
  customer.name = item.name;
  customer.contact = item.contact;
  customer.phone = item.phone;
  source.value = '';
  customerPickerOpen.value = false;
}

function addProduct(item: (typeof products)[number]) {
  productRows.value.push({
    id: `contract-product-${Date.now()}`,
    sourceLine: source.value || '手动',
    productCode: item.productCode,
    productName: item.productName,
    model: item.model,
    unit: item.unit,
    quantity: '',
    unitPrice: item.unitPrice.toFixed(2),
    deliveryTerm: '',
    paymentTerm: '',
  });
  productPickerOpen.value = false;
}

function removeProduct(id: string) {
  productRows.value = productRows.value.filter((row) => row.id !== id);
}

function toNumber(value: string) {
  const n = Number(String(value || '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function money(value: number) {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function handleFormAction(key: string) {
  if (key === 'reset') {
    source.value = '';
    customer.code = '';
    customer.name = '';
    customer.contact = '';
    customer.phone = '';
    productRows.value = [];
    discountAmount.value = '';
    detailText.value = '';
    submitMessage.value = '已重置。';
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    await createSalesContract({
      topic: '新增合同',
      code: '自动生成',
      customerName: customer.name || '未选择客户',
      customerContact: customer.contact,
      customerPhone: customer.phone,
      sourceCode: source.value || '手动',
      amount: contractTotal.value,
      discountAmount: toNumber(discountAmount.value),
      finalAmount: finalTotal.value,
      executionStatus: key === 'draft' ? 'draft' : 'pendingApproval',
      executionStatusName: key === 'draft' ? '草稿' : '待审批',
      status: key === 'draft' ? 'draft' : 'pendingApproval',
      statusName: key === 'draft' ? '草稿' : '待审批',
      detailHtml: detailText.value,
      products: productRows.value.map((row) => {
        const quantity = toNumber(row.quantity);
        const unitPrice = toNumber(row.unitPrice);
        return {
          ...row,
          quantity,
          unitPrice,
          amount: quantity * unitPrice,
        };
      }),
    });
    submitMessage.value = key === 'draft' ? '草稿已通过新增接口保存。' : '合同已通过新增接口提交审批。';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.aw-contract-total{display:flex;justify-content:flex-end;align-items:center;gap:18px;padding-top:12px;font-size:13px;flex-wrap:wrap}
.aw-contract-total strong{color:var(--aw-danger);font-family:var(--aw-font-num)}
.aw-contract-total label{display:inline-flex;align-items:center;gap:8px;color:var(--aw-fg-2)}
.aw-contract-total .aw-input{width:120px}
</style>
