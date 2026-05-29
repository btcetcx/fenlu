<template>
  <aw-form-page :actions="formActions" @back="emit('back')" @action="handleAction">
    <section class="aw-form-card">
      <div class="aw-detail-section-title">基础信息</div>
      <div class="aw-form-grid">
        <div class="aw-field">
          <label class="req">订单主题</label>
          <div class="aw-field-row">
            <input v-model="form.topic" class="aw-input" placeholder="手动输入订单主题" @input="source = undefined" />
            <button class="aw-tool-btn" type="button" title="选择订单来源" @click="openSourcePicker">选择订单来源</button>
          </div>
        </div>
        <div class="aw-field"><label>订单编号</label><input class="aw-input" value="自动生成" disabled /></div>
        <div class="aw-field"><label>订单来源</label><input class="aw-input" :value="source ? `${source.type} / ${source.code}` : '手动输入'" readonly /></div>
        <div class="aw-field">
          <label class="req">关联客户</label>
          <div class="aw-field-row">
            <input class="aw-input" :value="customer?.name || ''" placeholder="请选择客户" readonly @click="openCustomerPicker" />
            <button class="aw-tool-btn" type="button" title="选择客户" @click="openCustomerPicker">选择客户</button>
          </div>
        </div>
        <div class="aw-field">
          <label>客户联系人</label>
          <div class="aw-field-row">
            <input v-model="form.contactName" class="aw-input" placeholder="选择客户后自动带入" readonly @click="openContactPicker" />
            <button class="aw-tool-btn" type="button" title="选择联系人" :disabled="!customer" @click="openContactPicker">选择</button>
          </div>
        </div>
        <div class="aw-field"><label>联系电话</label><input v-model="form.contactPhone" class="aw-input" placeholder="选择联系人后带入" readonly /></div>
        <div class="aw-field"><label>交货地址</label><input v-model="form.deliveryAddress" class="aw-input" placeholder="自动带入，可修改" /></div>
        <div class="aw-field"><label class="req">交货日期</label><input v-model="form.deliveryDate" class="aw-input" placeholder="请选择" /></div>
        <div class="aw-field"><label>支付方式</label><input v-model="form.payMethod" class="aw-input" placeholder="从客户档案自动带入" /></div>
        <div class="aw-field"><label>信用额度</label><input class="aw-input" :value="creditText" placeholder="选择客户后自动带入" readonly /></div>
        <div class="aw-field"><label>信用管控</label><input class="aw-input" :value="creditControlText" readonly /></div>
        <div class="aw-field"><label>运费支付</label><select v-model="form.freightPay" class="aw-select"><option value="">从客户档案自动带入</option><option>客户支付</option><option>我方承担</option><option>到付</option></select></div>
        <div class="aw-field"><label>出库方式</label><select v-model="form.deliveryMode" class="aw-select"><option>自动出库</option><option>手动出库</option></select></div>
        <div class="aw-field"><label>订单状态</label><input class="aw-input" :value="source ? '审核中' : '草稿'" readonly /></div>
      </div>
      <div class="aw-form-note" :class="{ danger: creditBlocked }">
        信用管控会在订单确认时占用客户信用额度；若客户停用、账期异常或本单后超出额度，订单进入信用异常审批。
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">产品明细</div>
      <aw-editable-sub-table :columns="lineColumns" :rows="lineRows" add-text="新增明细" :action-width="80" @add="showProductPicker = true">
        <template #cell="{ column, row }">
          <span v-if="column.key === 'sourceLine'">{{ row.sourceLine || '手动' }}</span>
          <span v-else-if="column.key === 'priceSource'">{{ row.priceSource || '手动定价' }}</span>
          <input v-else-if="column.key === 'productNo'" v-model="row.productNo" class="aw-input" />
          <input v-else-if="column.key === 'productName'" v-model="row.productName" class="aw-input" />
          <input v-else-if="column.key === 'model'" v-model="row.model" class="aw-input" />
          <input v-else-if="column.key === 'unit'" v-model="row.unit" class="aw-input" />
          <input v-else-if="column.key === 'price'" v-model.number="row.price" class="aw-input" @input="recalc(row)" />
          <input v-else-if="column.key === 'quantity'" v-model.number="row.quantity" class="aw-input" @input="recalc(row)" />
          <input v-else-if="column.key === 'amount'" class="aw-input" :value="formatMoney(row.amount)" readonly />
          <input v-else-if="column.key === 'deliveryDate'" v-model="row.deliveryDate" class="aw-input" placeholder="请选择" />
          <input v-else-if="column.key === 'discountAmount'" v-model.number="row.discountAmount" class="aw-input" />
        </template>
        <template #actions="{ row }">
          <span class="aw-link" style="color:var(--aw-danger)" @click="removeLine(row.id)">删除</span>
        </template>
      </aw-editable-sub-table>
      <div v-if="lineRows.length === 0" class="aw-empty">暂无产品明细，点击“新增明细”选择产品</div>
      <div v-else class="aw-line-total">
        <span>合计</span>
        <span>总量：<strong>{{ totalQuantity }}</strong></span>
        <span>总金额：<strong>{{ formatMoney(totalAmount) }}</strong></span>
        <span>优惠后金额：<strong>{{ formatMoney(totalAfterDiscount) }}</strong></span>
      </div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">订单详情</div>
      <aw-rich-text-editor v-model="detailText" placeholder="请输入订单说明、客户要求、交付注意事项等信息" />
      <div v-if="submitMessage" class="aw-form-note">{{ submitMessage }}</div>
    </section>

    <section class="aw-form-card">
      <div class="aw-detail-section-title">附件</div>
      <div class="aw-attach-grid">
        <div class="aw-attach-card"><strong>新建文本文档.PDF</strong><span>文件大小：0 Bytes</span><span>上传日期：2024-08-01 17:45:27</span><div><span class="aw-link">重新上传</span><span class="aw-link">删除</span></div></div>
        <div class="aw-upload-card"><span class="aw-link">点击上传</span> / 拖拽到此区域</div>
      </div>
    </section>

    <div v-if="showSourcePicker" class="aw-mask" @click="showSourcePicker = false">
      <div class="aw-modal aw-order-modal" @click.stop>
        <div class="head"><span>选择订单来源</span><button class="aw-modal-close" type="button" @click="showSourcePicker = false">×</button></div>
        <div class="body aw-source-picker">
          <aside>
            <button v-for="type in sourceTypes" :key="type" :class="{ on: sourceType === type }" type="button" @click="sourceType = type">{{ type }}列表</button>
          </aside>
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th style="width:46px"></th><th>来源编号</th><th>来源主题</th><th>客户</th><th>交货日期</th><th>产品数</th></tr></thead>
              <tbody>
                <tr v-for="row in filteredSources" :key="row.id" @click="selectedSourceId = row.id">
                  <td><input type="radio" :checked="selectedSourceId === row.id" /></td>
                  <td class="aw-num">{{ row.code }}</td>
                  <td class="aw-link">{{ row.title }}</td>
                  <td>{{ row.customer }}</td>
                  <td>{{ row.deliveryDate }}</td>
                  <td>{{ row.products.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="foot"><button class="aw-btn" type="button" @click="showSourcePicker = false">取消</button><button class="aw-btn primary" type="button" @click="confirmSource">确定</button></div>
      </div>
    </div>

    <div v-if="showCustomerPicker" class="aw-mask" @click="showCustomerPicker = false">
      <div class="aw-modal aw-order-modal" @click.stop>
        <div class="head"><span>选择客户</span><button class="aw-modal-close" type="button" @click="showCustomerPicker = false">×</button></div>
        <div class="body">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th style="width:46px"></th><th>客户名称</th><th>客户分组</th><th>默认联系人</th><th>联系方式</th><th>客户经理</th><th>信用额度</th><th>已用额度</th><th>账期</th><th>信用状态</th></tr></thead>
              <tbody>
                <tr v-for="row in customers" :key="row.id" :class="{ disabled: row.disabled }" @click="!row.disabled && (selectedCustomerId = row.id)">
                  <td><input type="radio" :disabled="row.disabled" :checked="selectedCustomerId === row.id" /></td>
                  <td><span class="aw-link">{{ row.name }}</span><span v-if="row.disabled" class="aw-status gray">已停用</span></td>
                  <td>{{ row.group }}</td>
                  <td>{{ row.contacts[0]?.name }}</td>
                  <td>{{ row.contacts[0]?.phone }}</td>
                  <td>{{ row.manager }}</td>
                  <td>{{ formatMoney(row.creditLimit) }}</td>
                  <td>{{ formatMoney(row.creditUsed) }}</td>
                  <td>{{ row.payMethod }}</td>
                  <td>{{ row.creditStatus }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="foot"><button class="aw-btn" type="button" @click="showCustomerPicker = false">取消</button><button class="aw-btn primary" type="button" @click="confirmCustomer">确定</button></div>
      </div>
    </div>

    <div v-if="showContactPicker" class="aw-mask" @click="showContactPicker = false">
      <div class="aw-modal aw-contact-modal" @click.stop>
        <div class="head"><span>选择客户联系人</span><button class="aw-modal-close" type="button" @click="showContactPicker = false">×</button></div>
        <div class="body">
          <table class="aw-doc-tbl">
            <thead><tr><th style="width:46px"></th><th>姓名</th><th>职务</th><th>电话</th><th>邮箱</th></tr></thead>
            <tbody>
              <tr v-for="row in customer?.contacts || []" :key="row.id" @click="selectedContactId = row.id">
                <td><input type="radio" :checked="selectedContactId === row.id" /></td>
                <td>{{ row.name }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.phone }}</td>
                <td>{{ row.email }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="foot"><button class="aw-btn" type="button" @click="showContactPicker = false">取消</button><button class="aw-btn primary" type="button" @click="confirmContact">确定</button></div>
      </div>
    </div>

    <div v-if="showProductPicker" class="aw-mask" @click="showProductPicker = false">
      <div class="aw-modal aw-order-modal" @click.stop>
        <div class="head"><span>选择产品</span><button class="aw-modal-close" type="button" @click="showProductPicker = false">×</button></div>
        <div class="body">
          <div class="aw-doc-tbl-inner">
            <table class="aw-doc-tbl">
              <thead><tr><th style="width:46px"></th><th>产品编号</th><th>产品名称</th><th>规格型号</th><th>单位</th><th>参考单价</th></tr></thead>
              <tbody>
                <tr v-for="row in products" :key="row.productNo" @click="toggleProduct(row.productNo)">
                  <td><input type="checkbox" :checked="pickedProductNos.includes(row.productNo)" /></td>
                  <td class="aw-num">{{ row.productNo }}</td>
                  <td>{{ row.productName }}</td>
                  <td>{{ row.model }}</td>
                  <td>{{ row.unit }}</td>
                  <td>{{ formatMoney(row.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="foot"><button class="aw-btn" type="button" @click="showProductPicker = false">取消</button><button class="aw-btn primary" type="button" @click="openVariantPicker">下一步</button></div>
      </div>
    </div>

    <div v-if="variantRows.length" class="aw-mask" @click="variantRows = []">
      <div class="aw-modal aw-order-modal" @click.stop>
        <div class="head"><span>选择规格与属性</span><button class="aw-modal-close" type="button" @click="variantRows = []">×</button></div>
        <div class="body">
          <div class="aw-form-note">同一产品可能存在多规格、多属性，请确认后再生成订单产品明细。</div>
          <table class="aw-doc-tbl">
            <thead><tr><th>序号</th><th>产品编号</th><th>产品名称</th><th>规格</th><th>属性</th><th>单位</th><th>单价</th></tr></thead>
            <tbody>
              <tr v-for="(row, index) in variantRows" :key="row.productNo">
                <td>{{ index + 1 }}</td>
                <td>{{ row.productNo }}</td>
                <td>{{ row.productName }}</td>
                <td><select v-model="row.spec" class="aw-select"><option>标准规格</option><option>大包装规格</option><option>定制规格</option></select></td>
                <td><select v-model="row.attr" class="aw-select"><option>常规属性</option><option>防静电</option><option>耐高温</option><option>客户定制</option></select></td>
                <td>{{ row.unit }}</td>
                <td><input v-model.number="row.price" class="aw-input" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="foot"><button class="aw-btn" type="button" @click="variantRows = []">取消</button><button class="aw-btn primary" type="button" @click="addVariantRows">确定</button></div>
      </div>
    </div>
  </aw-form-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { createSalesOrder } from '@/app/api/sales/resources';
import AwEditableSubTable from '@/components/form-page/AwEditableSubTable.vue';
import AwFormPage from '@/components/form-page/AwFormPage.vue';
import AwRichTextEditor from '@/components/form-page/AwRichTextEditor.vue';
import type { EditableColumn, FormAction } from '@/components/form-page/types';

interface ContactRow {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
}

interface SourceRow {
  id: string;
  type: string;
  title: string;
  code: string;
  customer: string;
  contact: string;
  address: string;
  deliveryDate: string;
  products: OrderLine[];
}

interface CustomerRow {
  id: string;
  name: string;
  group: string;
  contacts: ContactRow[];
  address: string;
  manager: string;
  payMethod: string;
  creditLimit: number;
  creditUsed: number;
  creditStatus: string;
  creditPolicy: string;
  freightPay: string;
  deliveryMode: string;
  disabled?: boolean;
}

interface OrderLine {
  id: string;
  sourceLine?: string;
  priceSource?: string;
  productNo: string;
  productName: string;
  model: string;
  unit: string;
  price: number;
  quantity: number;
  amount: number;
  deliveryDate?: string;
  discountAmount?: number;
  spec?: string;
  attr?: string;
}

const emit = defineEmits<{ back: [] }>();
const form = reactive({
  topic: '',
  deliveryAddress: '',
  contactName: '',
  contactPhone: '',
  deliveryDate: '',
  payMethod: '',
  freightPay: '',
  deliveryMode: '自动出库',
});
const detailText = ref('');
const submitMessage = ref('');
const submitting = ref(false);
const source = ref<SourceRow>();
const customer = ref<CustomerRow>();
const showSourcePicker = ref(false);
const showCustomerPicker = ref(false);
const showContactPicker = ref(false);
const showProductPicker = ref(false);
const sourceType = ref('报价单');
const selectedSourceId = ref('');
const selectedCustomerId = ref('');
const selectedContactId = ref('');
const pickedProductNos = ref<string[]>([]);
const variantRows = ref<OrderLine[]>([]);
const lineRows = ref<OrderLine[]>([]);

const formActions: FormAction[] = [
  { key: 'draft', label: '保存草稿' },
  { key: 'reset', label: '重置' },
  { key: 'confirm', label: '确认', primary: true },
];
const lineColumns: EditableColumn[] = [
  { key: 'sourceLine', title: '来源明细', width: 150 },
  { key: 'priceSource', title: '价格来源', width: 150 },
  { key: 'productNo', title: '产品编号', width: 110 },
  { key: 'productName', title: '产品名称', width: 130 },
  { key: 'model', title: '规格型号', width: 120 },
  { key: 'unit', title: '单位', width: 70 },
  { key: 'price', title: '单价', width: 90 },
  { key: 'quantity', title: '销售数量', width: 90 },
  { key: 'amount', title: '合计金额', width: 110 },
  { key: 'deliveryDate', title: '交付日期', width: 120 },
  { key: 'discountAmount', title: '优惠金额', width: 100 },
];
const sourceRows: SourceRow[] = [
  {
    id: 'quote-1',
    type: '报价单',
    title: '荣某定制',
    code: 'SP-20251221001',
    customer: '傲为',
    contact: '张国',
    address: '北京市天竺区天竺路XX街道232号',
    deliveryDate: '2025-12-21',
    products: [
      { id: 'src-qp1', sourceLine: 'SP-20251221001-01', priceSource: '报价单 SP-20251221001 / V1', productNo: '7820864', productName: '半成品物料', model: 'HM-450', unit: 'KG', price: 50, quantity: 3, amount: 150, deliveryDate: '2025-12-21', discountAmount: 0 },
      { id: 'src-qp2', sourceLine: 'SP-20251221001-02', priceSource: '报价单 SP-20251221001 / V1', productNo: '5786931', productName: '半成品物料', model: 'HM-451', unit: 'KG', price: 48, quantity: 2, amount: 96, deliveryDate: '2025-12-21', discountAmount: 0 },
    ],
  },
  {
    id: 'contract-1',
    type: '合同',
    title: '合同：88888',
    code: 'HT-20251220001',
    customer: '深圳市启明科技有限公司',
    contact: '何志远',
    address: '深圳市南山区科技园北区',
    deliveryDate: '2026-01-05',
    products: [
      { id: 'src-cp1', sourceLine: 'HT-20251220001-01', priceSource: '合同 HT-20251220001', productNo: '8518691', productName: '铝合金型材', model: 'AL-6061', unit: 'KG', price: 32, quantity: 20, amount: 640, deliveryDate: '2026-01-05', discountAmount: 20 },
    ],
  },
  {
    id: 'project-1',
    type: '项目',
    title: '项目55555',
    code: 'PRJ-2026-05555',
    customer: '上海泽远制造有限公司',
    contact: '陆晨',
    address: '上海市浦东新区张江高科园区',
    deliveryDate: '2026-01-12',
    products: [
      { id: 'src-pp1', sourceLine: 'PRJ-2026-05555-01', priceSource: '项目报价确认', productNo: '6576642', productName: '精密轴承', model: 'BR-6205', unit: '个', price: 18, quantity: 10, amount: 180, deliveryDate: '2026-01-12', discountAmount: 0 },
    ],
  },
];
const customers: CustomerRow[] = [
  { id: 'c1', name: '傲为', group: '重点客户', contacts: [{ id: 'c1-1', name: '张国', title: '采购经理', phone: '15623596547', email: 'zhangguo@example.com' }, { id: 'c1-2', name: '刘敏', title: '财务', phone: '15623596548', email: 'liumin@example.com' }], address: '北京市天竺区天竺路XX街道232号', manager: '傲为', payMethod: '月结30天', creditLimit: 200000, creditUsed: 68000, creditStatus: '通过', creditPolicy: '正常放行', freightPay: '客户支付', deliveryMode: '自动出库' },
  { id: 'c2', name: '深圳市启明科技有限公司', group: '战略客户', contacts: [{ id: 'c2-1', name: '何志远', title: '采购总监', phone: '13900139002', email: 'hezhiyuan@example.com' }, { id: 'c2-2', name: '周雅', title: '商务', phone: '13900139003', email: 'zhouya@example.com' }], address: '深圳市南山区科技园北区', manager: '李文涛', payMethod: '月结45天', creditLimit: 500000, creditUsed: 420000, creditStatus: '临近额度', creditPolicy: '临近额度提醒', freightPay: '我方承担', deliveryMode: '自动出库' },
  { id: 'c3', name: '上海泽远制造有限公司', group: '普通客户', contacts: [{ id: 'c3-1', name: '陆晨', title: '采购员', phone: '13800138008', email: 'luchen@example.com' }], address: '上海市浦东新区张江高科园区', manager: '陈思源', payMethod: '现结', creditLimit: 0, creditUsed: 0, creditStatus: '现结待收', creditPolicy: '超额拦截', freightPay: '到付', deliveryMode: '手动出库' },
  { id: 'c4', name: '广州明德贸易有限公司', group: '渠道客户', contacts: [{ id: 'c4-1', name: '苏婧涵', title: '采购', phone: '13700137003', email: 'sujinghan@example.com' }], address: '广州市黄埔区科学城开源大道', manager: '赵强', payMethod: '月结15天', creditLimit: 80000, creditUsed: 26000, creditStatus: '通过', creditPolicy: '正常放行', freightPay: '客户支付', deliveryMode: '自动出库' },
  { id: 'c5', name: '东莞华美包装制品厂', group: '渠道客户', contacts: [{ id: 'c5-1', name: '赵一鸣', title: '老板', phone: '13600136004', email: 'zhaoyiming@example.com' }], address: '东莞市松山湖工业园', manager: '赵强', payMethod: '停止赊销', creditLimit: 0, creditUsed: 0, creditStatus: '已停用', creditPolicy: '停止赊销', freightPay: '客户支付', deliveryMode: '手动出库', disabled: true },
];
const products: OrderLine[] = [
  { id: 'p1', productNo: '7820864', productName: '半成品物料', model: '规格一', unit: '米', price: 53, quantity: 0, amount: 0, priceSource: '产品基础价' },
  { id: 'p2', productNo: '5786931', productName: '半成品物料', model: '规格一', unit: '米', price: 53, quantity: 0, amount: 0, priceSource: '产品基础价' },
  { id: 'p3', productNo: '8518691', productName: '铝合金型材', model: '规格一', unit: '米', price: 53, quantity: 0, amount: 0, priceSource: '产品基础价' },
  { id: 'p4', productNo: '6576642', productName: '精密轴承', model: '规格一', unit: '个', price: 53, quantity: 0, amount: 0, priceSource: '产品基础价' },
  { id: 'p5', productNo: '6081578', productName: '半成品物料', model: '规格一', unit: '米', price: 53, quantity: 0, amount: 0, priceSource: '产品基础价' },
];

const sourceTypes = ['报价单', '合同', '项目'];
const filteredSources = computed(() => sourceRows.filter((row) => row.type === sourceType.value));
const creditText = computed(() => (customer.value ? `${formatMoney(customer.value.creditUsed)} / ${formatMoney(customer.value.creditLimit)}` : ''));
const totalQuantity = computed(() => lineRows.value.reduce((sum, row) => sum + Number(row.quantity || 0), 0));
const totalAmount = computed(() => lineRows.value.reduce((sum, row) => sum + Number(row.amount || 0), 0));
const totalAfterDiscount = computed(() => totalAmount.value - lineRows.value.reduce((sum, row) => sum + Number(row.discountAmount || 0), 0));
const creditBlocked = computed(() => {
  if (!customer.value) return false;
  if (customer.value.disabled || customer.value.creditPolicy === '停止赊销') return true;
  if (customer.value.creditPolicy === '超额拦截' && customer.value.creditUsed + totalAfterDiscount.value > customer.value.creditLimit) return true;
  return false;
});
const creditControlText = computed(() => {
  if (!customer.value) return '待选择客户';
  if (creditBlocked.value) return '信用拦截';
  if (customer.value.creditPolicy === '临近额度提醒') return '临近额度提醒';
  return customer.value.creditPolicy || '正常放行';
});

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalc(row: Record<string, any>) {
  row.amount = Number(row.price || 0) * Number(row.quantity || 0);
}

function openSourcePicker() {
  selectedSourceId.value = source.value?.id || filteredSources.value[0]?.id || '';
  showSourcePicker.value = true;
}

function openCustomerPicker() {
  selectedCustomerId.value = customer.value?.id || customers.find((row) => !row.disabled)?.id || '';
  showCustomerPicker.value = true;
}

function openContactPicker() {
  if (!customer.value) return;
  selectedContactId.value = customer.value.contacts.find((row) => row.name === form.contactName)?.id || customer.value.contacts[0]?.id || '';
  showContactPicker.value = true;
}

function applyCustomer(row: CustomerRow, contactName?: string) {
  customer.value = row;
  const contact = row.contacts.find((item) => item.name === contactName) || row.contacts[0];
  form.contactName = contact?.name || '';
  form.contactPhone = contact?.phone || '';
  form.deliveryAddress = row.address;
  form.payMethod = row.payMethod;
  form.freightPay = row.freightPay;
  form.deliveryMode = row.deliveryMode;
}

function confirmSource() {
  const picked = sourceRows.find((row) => row.id === selectedSourceId.value);
  if (!picked) return;
  source.value = picked;
  form.topic = picked.title;
  form.deliveryDate = picked.deliveryDate;
  const matchedCustomer = customers.find((row) => row.name === picked.customer);
  if (matchedCustomer) applyCustomer(matchedCustomer, picked.contact);
  lineRows.value = picked.products.map((row, index) => ({ ...row, id: `${picked.id}-${index}` }));
  showSourcePicker.value = false;
}

function confirmCustomer() {
  const picked = customers.find((row) => row.id === selectedCustomerId.value && !row.disabled);
  if (!picked) return;
  applyCustomer(picked);
  lineRows.value = [];
  showCustomerPicker.value = false;
}

function confirmContact() {
  const picked = customer.value?.contacts.find((row) => row.id === selectedContactId.value);
  if (!picked) return;
  form.contactName = picked.name;
  form.contactPhone = picked.phone;
  showContactPicker.value = false;
}

function toggleProduct(productNo: string) {
  pickedProductNos.value = pickedProductNos.value.includes(productNo)
    ? pickedProductNos.value.filter((item) => item !== productNo)
    : [...pickedProductNos.value, productNo];
}

function openVariantPicker() {
  variantRows.value = products.filter((row) => pickedProductNos.value.includes(row.productNo)).map((row) => ({ ...row, spec: row.model, attr: '常规属性' }));
  showProductPicker.value = false;
}

function addVariantRows() {
  lineRows.value = [
    ...lineRows.value,
    ...variantRows.value.map((row, index) => ({
      ...row,
      id: `sale-order-${Date.now()}-${index}`,
      sourceLine: '手动',
      priceSource: row.priceSource || '产品基础价',
      model: `${row.spec} / ${row.attr}`,
      quantity: 0,
      amount: 0,
      discountAmount: 0,
    })),
  ];
  pickedProductNos.value = [];
  variantRows.value = [];
}

function removeLine(id: string) {
  lineRows.value = lineRows.value.filter((row) => row.id !== id);
}

function resetForm() {
  source.value = undefined;
  customer.value = undefined;
  lineRows.value = [];
  pickedProductNos.value = [];
  variantRows.value = [];
  form.topic = '';
  form.deliveryAddress = '';
  form.contactName = '';
  form.contactPhone = '';
  form.deliveryDate = '';
  form.payMethod = '';
  form.freightPay = '';
  form.deliveryMode = '自动出库';
  detailText.value = '';
}

async function handleAction(key: string) {
  if (key === 'reset') {
    resetForm();
    submitMessage.value = '已重置。';
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    await createSalesOrder({
      topic: form.topic || '新增销售订单',
      code: '自动生成',
      sourceType: source.value?.type || '手动',
      sourceCode: source.value ? `${source.value.type} ${source.value.code}` : '手动创建',
      customerName: customer.value?.name || '未选择客户',
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      payMethod: form.payMethod,
      freightPay: form.freightPay,
      deliveryMode: form.deliveryMode,
      amount: totalAfterDiscount.value,
      creditCheckName: creditControlText.value,
      creditHoldName: key === 'draft' ? '未占用' : creditBlocked.value ? '信用拦截' : '已占用',
      receivableAmount: totalAfterDiscount.value,
      invoiceRequestName: '未申请',
      receivedAmount: 0,
      status: key === 'draft' ? 'draft' : 'pendingApproval',
      statusName: key === 'draft' ? '草稿' : '审核中',
      progressName: '未发货',
      detailText: detailText.value,
      lines: lineRows.value,
    });
    submitMessage.value = key === 'draft' ? '草稿已通过新增接口保存。' : '订单已通过新增接口确认。';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.aw-line-total {
  display: flex;
  gap: 28px;
  padding: 12px;
  white-space: nowrap;
}
.aw-line-total strong {
  color: var(--aw-danger);
}
.aw-empty {
  margin-top: 10px;
  padding: 24px 12px;
  border: 1px dashed var(--aw-border-strong);
  border-radius: 6px;
  color: var(--aw-fg-3);
  text-align: center;
}
.aw-attach-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 1fr));
  gap: 12px;
}
.aw-attach-card,
.aw-upload-card {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px solid var(--aw-border);
  border-radius: 6px;
  background: #fff;
  color: var(--aw-fg-3);
  font-size: 12px;
}
.aw-upload-card {
  place-items: center;
  border-style: dashed;
  min-height: 118px;
}
.aw-order-modal {
  width: min(980px, 94vw);
  max-height: 86vh;
}
.aw-contact-modal {
  width: min(720px, 92vw);
}
.aw-source-picker {
  display: grid;
  grid-template-columns: 180px 1fr;
  padding: 0;
}
.aw-source-picker aside {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 8px;
  border-right: 1px solid var(--aw-border);
  background: var(--aw-surface-2);
}
.aw-source-picker aside button {
  border: 0;
  background: transparent;
  padding: 9px 10px;
  text-align: left;
  cursor: pointer;
}
.aw-source-picker aside button.on {
  background: var(--aw-primary-soft);
  color: var(--aw-primary);
}
.aw-form-note.danger {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
  color: var(--aw-danger);
}
tr.disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
